export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Fetch all active subscriptions from Stripe using cursor pagination.
 * Stripe list APIs allow up to 100 items per request, so we keep
 * requesting until has_more becomes false.
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

    const subscriptions = await getAllActiveSubscriptions();

    // Keep response useful but not too heavy
    const finalData = subscriptions.map((sub) => ({
      subscription_id: sub.id,
      customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id || "",
      status: sub.status,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      cancel_at_period_end: !!sub.cancel_at_period_end,
      created: sub.created,
      currency: sub.currency || "",
      collection_method: sub.collection_method || "",
      latest_invoice:
        typeof sub.latest_invoice === "string"
          ? sub.latest_invoice
          : sub.latest_invoice?.id || "",
      items:
        Array.isArray(sub.items?.data)
          ? sub.items.data.map((item) => ({
              subscription_item_id: item.id,
              price_id: item.price?.id || "",
              product_id:
                typeof item.price?.product === "string"
                  ? item.price.product
                  : item.price?.product?.id || "",
              quantity: item.quantity || 0,
              unit_amount: item.price?.unit_amount ?? null,
              interval: item.price?.recurring?.interval || "",
              interval_count: item.price?.recurring?.interval_count || 0,
            }))
          : [],
    }));

    return NextResponse.json({
      ok: true,
      total: finalData.length,
      subscriptions: finalData,
    });
  } catch (error) {
    console.error("Failed to fetch active subscriptions:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch active subscriptions",
        error:
          process.env.NODE_ENV !== "production"
            ? String(error?.message || error)
            : undefined,
      },
      { status: 500 }
    );
  }
}