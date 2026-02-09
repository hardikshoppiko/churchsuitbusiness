import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { dbEscape } from "@/lib/db-utils";

async function getAffiliateById(affiliate_id) {
  const [rows] = await db.query(`SELECT * FROM affiliate WHERE affiliate_id='${dbEscape(Number(affiliate_id))}' LIMIT 1`);
  return rows?.[0] || null;
}

async function updateAffiliate(affiliate_id, patch) {
  const sets = Object.keys(patch)
    .map((k) => `\`${k}\`='${dbEscape(patch[k])}'`)
    .join(", ");

  await db.query(`UPDATE affiliate SET ${sets}, date_modified=NOW() WHERE affiliate_id='${dbEscape(Number(affiliate_id))}'`);
}

/**
 * Returns:
 *  - { affiliate_status:"paid" } if already paid/active
 *  - { affiliate_status:"ready", clientSecret } to show Stripe Payment Element
 */
export async function getSubscriptionClientSecret(affiliate_id) {
  const affiliate = await getAffiliateById(affiliate_id);

  if (!affiliate) {
    return { affiliate_status: "not_found" };
  }

  // If your DB marks already paid
  if (affiliate.payment_status !== undefined && String(affiliate.payment_status || "").toLowerCase() === "paid") {
    return { affiliate_status: "paid" };
  }

  // 1) Stripe customer
  let stripe_customer_id = affiliate.stripe_customer_id || "";

  if (!stripe_customer_id) {
    const customer = await stripe.customers.create({
      email: affiliate.email,
      name: `${affiliate.firstname} ${affiliate.lastname}`,
      phone: affiliate.telephone,
      metadata: { affiliate_id: String(affiliate.affiliate_id) },
    });

    stripe_customer_id = customer.id;

    await updateAffiliate(affiliate.affiliate_id, {
      stripe_customer_id,
    });
  }

  // 2) Try reuse stored subscription if exists
  if (affiliate.recurring_billing_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(
        affiliate.recurring_billing_id,
        { expand: ["latest_invoice.payment_intent"] }
      );

      // If already active -> mark paid
      if (sub.status === "active" || sub.status === "trialing") {
        await updateAffiliate(affiliate.affiliate_id, { payment_status: "paid" });
        return { affiliate_status: "paid" };
      }

      const pi = sub.latest_invoice?.payment_intent;
      if (pi?.client_secret) {
        return { affiliate_status: "ready", clientSecret: pi.client_secret };
      }
    } catch (e) {
      // ignore and create new subscription
    }
  }

  // 3) Create new incomplete subscription
  const priceId = affiliate.stripe_plan_id; // must be Stripe PRICE ID

  if (!priceId) {
    return { affiliate_status: "error", message: "Stripe plan/price id missing." };
  }

  const subscription = await stripe.subscriptions.create({
    customer: stripe_customer_id,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { 
      payment_method_types: ["card"],
      save_default_payment_method: "on_subscription"
    },
    expand: ["latest_invoice.payment_intent"],
    metadata: {
      affiliate_id: String(affiliate.affiliate_id),
      affiliate_plan_id: String(affiliate.affiliate_plan_id || ""),
    },
  });

  const pi = subscription.latest_invoice?.payment_intent;

  if (!pi?.client_secret) {
    return { affiliate_status: "error", message: "Could not create PaymentIntent." };
  }

  await updateAffiliate(affiliate.affiliate_id, {
    stripe_customer_id: stripe_customer_id,
    recurring_billing_id: subscription.id,
    stripe_payment_intent_id: pi.id,
    affiliate_status_id: 5, // Pending Payment
  });

  return { affiliate_status: "ready", clientSecret: pi.client_secret };
}