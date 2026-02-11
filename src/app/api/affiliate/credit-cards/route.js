// src/app/api/affiliate/credit-cards/route.js
export const runtime = "nodejs";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { dbEscape, getClientIp } from "@/lib/db-utils";

async function getAffiliateStripeCustomerId(affiliate_id) {
  const [rows] = await db.query(`
    SELECT affiliate_id, email, firstname, lastname, stripe_customer_id
    FROM affiliate
    WHERE affiliate_id='${Number(affiliate_id)}' AND is_delete=0
    LIMIT 1
  `);

  return rows?.[0] || null;
}

// Optional: if stripe_customer_id missing, create and save
async function ensureStripeCustomer(affiliate) {
  if (!affiliate) return null;

  let customerId = String(affiliate.stripe_customer_id || "").trim();
  if (customerId) return customerId;

  const email = String(affiliate.email || "").trim();
  const name = `${String(affiliate.firstname || "").trim()} ${String(affiliate.lastname || "").trim()}`.trim();

  const customer = await stripe.customers.create({
    email: email || undefined,
    name: name || undefined,
    metadata: { affiliate_id: String(affiliate.affiliate_id) },
  });

  customerId = customer.id;

  await db.query(`
    UPDATE affiliate
    SET stripe_customer_id='${dbEscape(customerId)}', date_modified=NOW()
    WHERE affiliate_id='${Number(affiliate.affiliate_id)}'
    LIMIT 1
  `);

  return customerId;
}

function mapCard(pm) {
  const c = pm.card || {};
  return {
    id: pm.id,
    brand: c.brand || "",
    last4: c.last4 || "",
    exp_month: c.exp_month || null,
    exp_year: c.exp_year || null,
    funding: c.funding || "",
    country: c.country || "",
  };
}

async function listSubsForCustomer(customerId) {
  // Stripe can't list multiple statuses at once, so do 2 calls
  const [active, trialing] = await Promise.all([
    stripe.subscriptions.list({ customer: customerId, status: "active", limit: 100 }),
    stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 100 }),
  ]);

  return [...(active?.data || []), ...(trialing?.data || [])];
}

async function getCustomerDefaultPm(customerId) {
  const cust = await stripe.customers.retrieve(customerId);
  return String(cust?.invoice_settings?.default_payment_method || "");
}

// GET: list cards + default
export async function GET() {
  const session = await getSession();

  if (!session?.affiliate_id) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const affiliate = await getAffiliateStripeCustomerId(session.affiliate_id);
  if (!affiliate) {
    return Response.json({ ok: false, message: "Affiliate not found" }, { status: 404 });
  }

  const customerId = await ensureStripeCustomer(affiliate);

  const [cust, pms] = await Promise.all([
    stripe.customers.retrieve(customerId),
    stripe.paymentMethods.list({ customer: customerId, type: "card" }),
  ]);

  const defaultPm = String(cust?.invoice_settings?.default_payment_method || "");
  const cards = (pms?.data || []).map(mapCard);

  return Response.json({
    ok: true,
    customer_id: customerId,
    default_payment_method: defaultPm,
    cards,
  });
}

// POST: actions
export async function POST(req) {
  const session = await getSession();

  if (!session?.affiliate_id) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "").trim();

  const affiliate = await getAffiliateStripeCustomerId(session.affiliate_id);
  if (!affiliate) {
    return Response.json({ ok: false, message: "Affiliate not found" }, { status: 404 });
  }

  const customerId = await ensureStripeCustomer(affiliate);

  // 1) Create SetupIntent for adding card
  if (action === "create_setup_intent") {
    const ip = getClientIp(req);

    const intent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
      metadata: {
        affiliate_id: String(session.affiliate_id),
        affiliate_user_id: String(session.affiliate_user_id || ""),
        ip: String(ip || ""),
      },
    });

    return Response.json({ ok: true, client_secret: intent.client_secret });
  }

  // 2) Set default payment method (after confirm)
  if (action === "set_default") {
    const payment_method = String(body?.payment_method || "").trim();
    if (!payment_method) {
      return Response.json({ ok: false, message: "payment_method is required" }, { status: 400 });
    }

    // attach to customer (safe even if already attached)
    try {
      await stripe.paymentMethods.attach(payment_method, { customer: customerId });
    } catch (e) {
      // ignore "already attached" errors
    }

    // 1) customer default (invoice settings)
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: payment_method },
    });

    // 2) subscription default (recurring charge uses this)
    const subs = await listSubsForCustomer(customerId);

    for (const s of subs) {
      await stripe.subscriptions.update(s.id, {
        default_payment_method: payment_method,
      });
    }

    return Response.json({
      ok: true,
      message: "Default card updated",
      updated_subscriptions: subs.length,
    });
  }

  // 3) Remove card
  if (action === "remove") {
    const payment_method = String(body?.payment_method || "").trim();

    if (!payment_method) {
      return Response.json({ ok: false, message: "payment_method is required" }, { status: 400 });
    }

    // Block removing the customer's default card
    const defaultPm = await getCustomerDefaultPm(customerId);
    
    if (defaultPm && defaultPm === payment_method) {
      return Response.json(
        { ok: false, message: "You can't remove your default card. Please set another card as default first." },
        { status: 400 }
      );
    }

    // Block removing if subscription default is this card
    const subs = await listSubsForCustomer(customerId);
    const usedBySub = subs.find((s) => String(s?.default_payment_method || "") === payment_method);

    if (usedBySub) {
      return Response.json(
        {
          ok: false,
          message: "This card is used for your subscription billing. Set another default card first, then remove it.",
        },
        { status: 400 }
      );
    }

    await stripe.paymentMethods.detach(payment_method);

    return Response.json({ ok: true, message: "Card removed" });
  }

  return Response.json({ ok: false, message: "Invalid action" }, { status: 400 });
}