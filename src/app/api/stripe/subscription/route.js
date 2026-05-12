export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/db-utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Convert unix timestamp (seconds) to MM/DD/YYYY
 */
function formatDateFromUnix(unixSeconds) {
  const n = Number(unixSeconds || 0);
  if (!n) return "";

  return formatDate(new Date(n * 1000), "MM/DD/YYYY");
}

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
     * Group subscriptions by Stripe customer_id
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

      /**
       * Stripe period dates are taken from first subscription item
       */
      const itemCurrentPeriodStart = Number(
        sub?.items?.data?.[0]?.current_period_start || 0
      );

      const itemCurrentPeriodEnd = Number(
        sub?.items?.data?.[0]?.current_period_end || 0
      );

      subscriptionsByCustomer.get(customerId).push({
        subscription_id: String(sub.id || ""),
        customer_id: customerId,
        status: String(sub.status || ""),
        current_period_start: itemCurrentPeriodStart,
        current_period_end: itemCurrentPeriodEnd,
        period_start_date: formatDateFromUnix(itemCurrentPeriodStart),
        period_end_date: formatDateFromUnix(itemCurrentPeriodEnd),
        next_billing_date: formatDateFromUnix(itemCurrentPeriodEnd),
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
     * Find affiliates where:
     * - stripe_customer_id matches an active Stripe customer
     * - recurring_billing_id does NOT match any active Stripe subscription id
     */
    const mismatchAffiliates = [];

    for (const affiliate of affiliates) {
      const affiliateId = Number(affiliate.affiliate_id || 0);
      const stripeCustomerId = String(affiliate.stripe_customer_id || "").trim();
      const recurringBillingId = String(affiliate.recurring_billing_id || "").trim();

      if (!stripeCustomerId) {
        continue;
      }

      const customerSubscriptions =
        subscriptionsByCustomer.get(stripeCustomerId) || [];

      if (customerSubscriptions.length === 0) {
        continue;
      }

      const matchedSubscription = customerSubscriptions.find(
        (sub) => sub.subscription_id === recurringBillingId
      );

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
            period_start_date: sub.period_start_date,
            period_end_date: sub.period_end_date,
            next_billing_date: sub.next_billing_date,
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