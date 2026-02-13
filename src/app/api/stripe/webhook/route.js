import { serialize } from "php-serialize";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { dbEscape } from "@/lib/db-utils";

import { sendPaymentFailedEmail, sendSubscriptionActivatedEmail, sendSubscriptionRenewedEmail, sendSubscriptionUpdatedEmail } from "@/lib/email";

export const runtime = "nodejs";

function jsonOK(obj) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
function jsonErr(message, status = 400) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function dollarsFromCents(v) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n / 100 : 0;
}

async function getAffiliateIdFromInvoice(invoice) {
  const subscriptionId = invoice.subscription || null;
  const customerId = invoice.customer || null;

  if (!subscriptionId) return { affiliate_id: null, subscriptionId, customerId };

  const sub = await stripe.subscriptions.retrieve(subscriptionId);

  const affiliate_id =
    sub?.metadata?.affiliate_id ||
    sub?.metadata?.affiliateId ||
    null;

  return { affiliate_id, subscriptionId, customerId, subscription: sub };
}

async function hasPaymentRowAlready(affiliateId, invoice_number, payment_charge_id) {
  const affId = Number(affiliateId);
  if (!affId) return false;

  const inv = String(invoice_number || "");
  const chg = String(payment_charge_id || "");

  const where = [];
  where.push(`affiliate_id=${affId}`);

  if (chg) where.push(`payment_charge_id='${dbEscape(chg)}'`);
  if (inv) where.push(`invoice_number='${dbEscape(inv)}'`);

  // If both exist, check either match (Stripe can retry)
  const sql = `
    SELECT affiliate_id
    FROM affiliate_payment
    WHERE affiliate_id=${affId}
      AND (
        ${chg ? `payment_charge_id='${dbEscape(chg)}'` : "0"}
        OR
        ${inv ? `invoice_number='${dbEscape(inv)}'` : "0"}
      )
    LIMIT 1
  `;

  const [rows] = await db.query(sql);
  return !!rows?.[0];
}

async function getPaymentStage(affiliateId) {
  const affId = Number(affiliateId);
  if (!affId) return "unknown";

  const [rows] = await db.query(`
    SELECT COUNT(*) AS total
    FROM affiliate_payment
    WHERE affiliate_id = ${affId}
      AND payment_status = 1
  `);

  const total = Number(rows?.[0]?.total || 0);

  // console.log("Successful payment count:", total);

  return (total === 1 || total === 0) ? "first" : "renewal";
}

async function markPaidAndInsertPayment({ affiliate_id, invoice, subscriptionId, customerId }) {
  const affId = Number(affiliate_id);
  if (!affId) return null;

  const invoice_number = invoice.number || invoice.id || "";
  const payment_charge_id = invoice.charge || invoice.payment_intent || invoice.id || "";

  const amount = dollarsFromCents(invoice.amount_paid || 0);
  const payment_status = 1;

  // ✅ serialize FULL Stripe invoice
  const descriptionSerialized = serialize(invoice);

  // // ✅ idempotency: avoid duplicate inserts on webhook retries
  // const exists = await hasPaymentRowAlready(affId, invoice_number, payment_charge_id);

  // ✅ Paid = activate + set dates
  // Start_date = NOW, End_date = NOW+30 days (your requirement)
  await db.query(`UPDATE affiliate SET affiliate_status_id=2, approved=1, status=1, stripe_customer_id='${dbEscape(String(customerId || ""))}', recurring_billing_id='${dbEscape(String(subscriptionId || ""))}', end_date=DATE_ADD(NOW(), INTERVAL 30 DAY), date_modified=NOW() WHERE affiliate_id=${affId}`);

  // Activate affiliate_user too
  await db.query(`UPDATE affiliate_user SET status=1, date_modified=NOW() WHERE affiliate_id=${affId}`);

  await db.query(`INSERT INTO affiliate_payment SET affiliate_id=${affId}, payment_charge_id='${dbEscape(String(payment_charge_id))}', invoice_number='${dbEscape(String(invoice_number))}', description='${dbEscape(String(descriptionSerialized))}', amount='${dbEscape(String(amount))}', start_date=NOW(), end_date=DATE_ADD(NOW(), INTERVAL 30 DAY), payment_status=${payment_status}, date_added=NOW()`);

  // ✅ Determine payment stage
  const paymentStage = await getPaymentStage(affId);

  // console.log(`Payment Stage: ${paymentStage}`);

  const [rows] = await db.query(`SELECT email, firstname, lastname FROM affiliate WHERE affiliate_id=${affId} LIMIT 1`);

  const aff = rows?.[0];

  // console.log(`Affiliate: ${aff}`);

  const name = `${aff?.firstname || ""} ${aff?.lastname || ""}`.trim();

  if (aff?.email) {
    if (paymentStage === "first") {
      await sendSubscriptionActivatedEmail({
        to: aff.email,
        name,
        affiliateId: affId,
      });
    } else {
      await sendSubscriptionRenewedEmail({
        to: aff.email,
        name,
        affiliateId: affId,
        amount,
        invoiceId: invoice.id,
      });
    }
  }

  return { affId, invoice_number, payment_charge_id, amount };
}

async function markFailedAndInsertPayment({ affiliate_id, invoice, subscriptionId, customerId }) {
  const affId = Number(affiliate_id);

  if (!affId) {
    return null;
  }

  const invoice_number = invoice.number || invoice.id || "";
  const payment_charge_id = invoice.charge || invoice.payment_intent || invoice.id || "";
  const amount = dollarsFromCents(invoice.amount_due || invoice.amount_remaining || 0);
  const payment_status = 0;

  // // ✅ serialize FULL invoice
  // const descriptionSerialized = serialize(invoice);

  // // ✅ idempotency
  // const exists = await hasPaymentRowAlready(affId, invoice_number, payment_charge_id);

  // Mark affiliate as failed (optional but useful)
  await db.query(`UPDATE affiliate SET affiliate_status_id=16, date_modified=NOW() WHERE affiliate_id=${affId}`);

  // Insert failed payment row (only once)
  await db.query(`INSERT INTO affiliate_payment SET affiliate_id=${affId}, payment_charge_id='', invoice_number='', description='Payment Failed!', amount='', start_date='0000-00-00 00:00:00', end_date='0000-00-00 00:00:00', payment_status=${payment_status}, date_added=NOW()`);

  // Send email
  const [rows] = await db.query(`SELECT email, firstname, lastname FROM affiliate WHERE affiliate_id=${affId} LIMIT 1`);

  const aff = rows?.[0];
  if (aff?.email) {
    await sendPaymentFailedEmail({
      to: aff.email,
      name: `${aff.firstname || ""} ${aff.lastname || ""}`.trim(),
      invoiceId: invoice.id,
      affiliateId: affId,
    });
  }

  return { affId, invoice_number, payment_charge_id, amount };
}

export async function GET() {
  return Response.json({ ok: true, route: "/api/stripe/webhook" });
}

export async function POST(req) {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) return jsonErr("Missing stripe-signature header", 400);

    const rawBody = await req.text();

    // console.log(rawBody);

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log()
      return jsonErr(`Webhook signature verification failed: ${err.message}`, 400);
    }

    // console.log(`Event: ${event}`);

    // ✅ subscription success events
    if (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;

      // console.log(`Invoice: ${invoice}`);

      const { affiliate_id, subscriptionId, customerId } = await getAffiliateIdFromInvoice(invoice);

      // console.log(`Affiliate ID: ${affiliate_id}`);
      // console.log(`Subscription ID: ${subscriptionId}`);
      // console.log(`Customer ID: ${customerId}`);

      if (!affiliate_id) {
        return jsonOK({
          received: true,
          warning: "affiliate_id missing in subscription metadata",
          event: event.type,
          invoice: invoice.id,
        });
      }

      const result = await markPaidAndInsertPayment({
        affiliate_id,
        invoice,
        subscriptionId,
        customerId,
      });

      return jsonOK({ received: true, event: event.type, affiliate_id, result });
    }

    // ✅ failed renewal / failed attempt
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;

      const { affiliate_id, subscriptionId, customerId } = await getAffiliateIdFromInvoice(invoice);

      if (!affiliate_id) {
        return jsonOK({
          received: true,
          warning: "affiliate_id missing in subscription metadata",
          event: event.type,
          invoice: invoice.id,
        });
      }

      const result = await markFailedAndInsertPayment({
        affiliate_id,
        invoice,
        subscriptionId,
        customerId,
      });

      return jsonOK({ received: true, event: event.type, affiliate_id, result });
    }

    return jsonOK({ received: true, event: event.type });
  } catch (e) {
    return jsonErr(e?.message || "Webhook failed", 500);
  }
}