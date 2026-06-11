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
 * Convert any JS/MySQL date to YYYY-MM-DD
 * This is used only for comparison.
 */
function normalizeDateOnly(value) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Format DB date to MM/DD/YYYY for display.
 */
function formatDbDate(value) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return formatDate(date, "MM/DD/YYYY");
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

/**
 * NEW SEPARATE FUNCTION:
 *
 * Check active Stripe customer's next billing date
 * against database affiliate.end_date.
 *
 * This function is separate from your existing recurring_billing_id
 * mismatch logic, so future confusion is avoided.
 */
async function getBillingDateMismatchAffiliates(subscriptionsByCustomer) {
  const [rows] = await db.query(`
    SELECT
      affiliate_id,
      stripe_customer_id,
      recurring_billing_id,
      end_date,
      status,
      is_delete
    FROM affiliate
    WHERE status = 1
      AND is_delete = 0
      AND stripe_customer_id IS NOT NULL
      AND stripe_customer_id != ''
  `);

  const affiliates = Array.isArray(rows) ? rows : [];
  const billingDateMismatchAffiliates = [];

  for (const affiliate of affiliates) {
    const affiliateId = Number(affiliate.affiliate_id || 0);
    const stripeCustomerId = String(affiliate.stripe_customer_id || "").trim();
    const recurringBillingId = String(
      affiliate.recurring_billing_id || ""
    ).trim();

    const customerSubscriptions =
      subscriptionsByCustomer.get(stripeCustomerId) || [];

    if (customerSubscriptions.length === 0) {
      continue;
    }

    /**
     * First prefer exact recurring_billing_id match.
     * If recurring_billing_id is old/wrong, use first active subscription
     * for checking Stripe next billing date.
     */
    const matchedSubscription =
      customerSubscriptions.find(
        (sub) => sub.subscription_id === recurringBillingId
      ) || customerSubscriptions[0];

    const dbEndDateCompare = normalizeDateOnly(affiliate.end_date);

    const stripeNextBillingDateCompare = normalizeDateOnly(
      matchedSubscription.current_period_end
        ? new Date(Number(matchedSubscription.current_period_end) * 1000)
        : ""
    );

    if (!dbEndDateCompare || !stripeNextBillingDateCompare) {
      continue;
    }

    if (dbEndDateCompare !== stripeNextBillingDateCompare) {
      billingDateMismatchAffiliates.push({
        affiliate_id: affiliateId,
        stripe_customer_id: stripeCustomerId,
        recurring_billing_id: recurringBillingId,

        db_end_date: formatDbDate(affiliate.end_date),
        db_end_date_compare: dbEndDateCompare,

        stripe_subscription_id: matchedSubscription.subscription_id,
        stripe_next_billing_date: matchedSubscription.next_billing_date,
        stripe_next_billing_date_compare: stripeNextBillingDateCompare,

        stripe_period_start_date: matchedSubscription.period_start_date,
        stripe_period_end_date: matchedSubscription.period_end_date,
        stripe_status: matchedSubscription.status,

        cancel_at_period_end: matchedSubscription.cancel_at_period_end,

        status: Number(affiliate.status || 0),
        is_delete: Number(affiliate.is_delete || 0),
      });
    }
  }

  return billingDateMismatchAffiliates;
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

      const createdDate = Number(sub.created || 0);

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

        /**
         * Small fix:
         * Stripe created is also Unix timestamp seconds.
         */
        created: formatDateFromUnix(createdDate),
      });
    }

    /**
     * STEP 3:
     * Fetch affiliates from DB
     */
    const affiliates = await getAllLiveAffiliates();

    /**
     * STEP 4:
     * Your current existing check:
     *
     * Find affiliates where:
     * - stripe_customer_id matches an active Stripe customer
     * - recurring_billing_id does NOT match any active Stripe subscription id
     */
    const mismatchAffiliates = [];

    for (const affiliate of affiliates) {
      const affiliateId = Number(affiliate.affiliate_id || 0);
      const stripeCustomerId = String(affiliate.stripe_customer_id || "").trim();
      const recurringBillingId = String(
        affiliate.recurring_billing_id || ""
      ).trim();

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

    /**
     * STEP 5:
     * New separate check:
     *
     * Check Stripe next billing date with database end_date.
     */
    const billingDateMismatchAffiliates =
      await getBillingDateMismatchAffiliates(subscriptionsByCustomer);

    return NextResponse.json({
      ok: true,
      total_active_stripe_subscriptions: subscriptions.length,
      total_active_affiliates: affiliates.length,

      total_mismatch_affiliates: mismatchAffiliates.length,
      mismatch_affiliates: mismatchAffiliates,

      total_billing_date_mismatch_affiliates:
        billingDateMismatchAffiliates.length,

      billing_date_mismatch_affiliates: billingDateMismatchAffiliates,
    });
  } catch (error) {
    console.error(
      "Failed to compare Stripe subscriptions with affiliates:",
      error
    );

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