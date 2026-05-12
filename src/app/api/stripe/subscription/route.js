export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Fetch all ACTIVE subscriptions from Stripe using pagination
 */
async function getAllActiveSubscriptions() {
  const allSubscriptions = [];
  let startingAfter = null;
  let hasMore = true;

  while (hasMore) {
    const params = {
      status: "active",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    };

    const response = await stripe.subscriptions.list(params);
    const rows = Array.isArray(response?.data) ? response.data : [];

    allSubscriptions.push(...rows);

    hasMore = !!response?.has_more;

    if (hasMore && rows.length > 0) {
      startingAfter = rows[rows.length - 1].id;
    } else {
      startingAfter = null;
    }
  }

  return allSubscriptions;
}

/**
 * Fetch all active affiliates from DB
 * condition:
 * - status = 1
 * - is_delete = 0
 */
async function getAllLiveAffiliates() {
  const [rows] = await db.query(`
    SELECT
      affiliate_id,
      stripe_customer_id,
      recurring_billing_id,
      status,
      is_delete
    FROM affiliate
    WHERE status = 1
      AND is_delete = 0
  `);

  return Array.isArray(rows) ? rows : [];
}

export async function GET() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          ok: false,
          message: "STRIPE_SECRET_KEY is missing",
        },
        { status: 500 }
      );
    }

    /**
     * STEP 1:
     * Fetch all active Stripe subscriptions
     */
    const subscriptions = await getAllActiveSubscriptions();

    /**
     * STEP 2:
     * Make a lookup map by customer_id
     *
     * One customer may have one or more active subscriptions,
     * so store them in array.
     */
    const subscriptionsByCustomer = new Map();

    for (const sub of subscriptions) {
      const customerId =
        typeof sub.customer === "string"
          ? String(sub.customer)
          : String(sub.customer?.id || "");

      if (!customerId) continue;

      if (!subscriptionsByCustomer.has(customerId)) {
        subscriptionsByCustomer.set(customerId, []);
      }

      subscriptionsByCustomer.get(customerId).push({
        subscription_id: String(sub.id || ""),
        customer_id: customerId,
        status: String(sub.status || ""),
        current_period_start: sub.current_period_start || 0,
        current_period_end: sub.current_period_end || 0,
        cancel_at_period_end: !!sub.cancel_at_period_end,
        created: sub.created || 0,
      });
    }

    /**
     * STEP 3:
     * Fetch affiliates from DB
     */
    const affiliates = await getAllLiveAffiliates();

    /**
     * STEP 4:
     * Compare affiliate.stripe_customer_id with Stripe customer_id
     * and then compare affiliate.recurring_billing_id with
     * active Stripe subscription ids for that same customer
     *
     * We return only mismatched rows:
     * customer matches, but subscription id is different
     */
    const mismatchAffiliates = [];

    for (const affiliate of affiliates) {
      const affiliateId = Number(affiliate.affiliate_id || 0);
      const stripeCustomerId = String(affiliate.stripe_customer_id || "").trim();
      const recurringBillingId = String(affiliate.recurring_billing_id || "").trim();

      if (!stripeCustomerId) {
        continue;
      }

      const customerSubscriptions = subscriptionsByCustomer.get(stripeCustomerId) || [];

      /**
       * If no active subscription found in Stripe for this customer,
       * skip for now because your requirement says:
       * fetch affiliates whose subscription id is different
       * than fetched Stripe subscription.
       *
       * If later you want, we can also return "no active subscription found".
       */
      if (customerSubscriptions.length === 0) {
        continue;
      }

      /**
       * Check if affiliate recurring_billing_id matches ANY active Stripe sub id
       * for this customer.
       */
      const matchedSubscription = customerSubscriptions.find(
        (sub) => sub.subscription_id === recurringBillingId
      );

      /**
       * If no matching subscription id found, then this affiliate is mismatch
       */
      if (!matchedSubscription) {
        mismatchAffiliates.push({
          affiliate_id: affiliateId,
          stripe_customer_id: stripeCustomerId,
          recurring_billing_id: recurringBillingId,
          status: Number(affiliate.status || 0),
          is_delete: Number(affiliate.is_delete || 0),

          stripe_active_subscriptions: customerSubscriptions.map((sub) => ({
            subscription_id: sub.subscription_id,
            customer_id: sub.customer_id,
            status: sub.status,
            current_period_start: sub.current_period_start,
            current_period_end: sub.current_period_end,
            cancel_at_period_end: sub.cancel_at_period_end,
            created: sub.created,
          })),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      total_active_stripe_subscriptions: subscriptions.length,
      total_active_affiliates: affiliates.length,
      total_mismatch_affiliates: mismatchAffiliates.length,
      mismatch_affiliates: mismatchAffiliates,
    });
  } catch (error) {
    console.error("Failed to compare Stripe subscriptions with affiliates:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to compare Stripe subscriptions with affiliates",
        error:
          process.env.NODE_ENV !== "production"
            ? String(error?.message || error)
            : undefined,
      },
      { status: 500 }
    );
  }
}