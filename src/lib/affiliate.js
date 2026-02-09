import { db } from "@/lib/db";
import { dbEscape } from "./db-utils";

function toNumber(v, fallback = 0) {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function getAffiliatePlans() {
  const [rows] = await db.query(`
    SELECT
      affiliate_plan_id,
      name,
      tag_line,
      fees,
      stripe_plan_id,
      discount_type,
      discount,
      shipping,
      sort_order,
      status,
      price_schema,
      default_markup,
      retail_price_commission,
      is_markup_required,
      is_catalog_access,
      date_added,
      date_modified,
      user_added,
      user_modified,
      is_delete
    FROM affiliate_plan
    WHERE status = 1 AND is_delete = 0
    ORDER BY sort_order ASC, fees ASC
  `);

  // Return full plan object (future-safe)
  return rows.map((r) => ({
    affiliate_plan_id: toNumber(r.affiliate_plan_id),
    name: r.name || "",
    tag_line: r.tag_line || "",

    fees: toNumber(r.fees),
    shipping: toNumber(r.shipping),

    // Discount rules
    discount_type: r.discount_type || "", // e.g. "P" or "F" (you decide)
    discount: toNumber(r.discount),

    // Stripe
    stripe_plan_id: r.stripe_plan_id || "",

    // Pricing rules
    price_schema: toNumber(r.price_schema), // tinyint
    default_markup: toNumber(r.default_markup),
    retail_price_commission: toNumber(r.retail_price_commission),
    is_markup_required: toNumber(r.is_markup_required), // tinyint 0/1
    is_catalog_access: toNumber(r.is_catalog_access),   // tinyint 0/1

    // Meta
    sort_order: toNumber(r.sort_order),
    status: toNumber(r.status),
    is_delete: toNumber(r.is_delete),
    date_added: r.date_added,
    date_modified: r.date_modified,
    user_added: toNumber(r.user_added),
    user_modified: toNumber(r.user_modified),
  }));
}

export async function getAffiliate(affiliateId) {
  const [rows] = await db.query(`SELECT a.*, z.name AS state_name, c.name AS country_name, s.name AS affiliate_status FROM affiliate a LEFT JOIN zone z ON(a.zone_id = z.zone_id) LEFT JOIN country c ON(a.country_id = c.country_id) LEFT JOIN affiliate_status s ON(s.affiliate_status_id = a.affiliate_status_id) WHERE a.affiliate_id = ? AND a.is_delete = 0`, [affiliateId]);

  if (rows.length === 0) return null;

  const r = rows[0];

  return {
    affiliate_id: toNumber(r.affiliate_id),
    affiliate_type: toNumber(r.affiliate_type),
    fees: toNumber(r.fees),
    store_name: dbEscape(r.store_name) || "",
    firstname: dbEscape(r.firstname) || "",
    lastname: dbEscape(r.lastname) || "",
    email: dbEscape(r.email) || "",
    telephone: dbEscape(r.telephone) || "",
    website: dbEscape(r.website) || "",
    address_1: dbEscape(r.address_1) || "",
    address_2: dbEscape(r.address_2) || "",
    city: dbEscape(r.city) || "",
    postcode: dbEscape(r.postcode) || "",
    country_id: toNumber(r.country_id) || 0,
    country_name: dbEscape(r.country_name) || "",
    zone_id: toNumber(r.zone_id) || 0,
    zone_name: dbEscape(r.state_name) || "",
    is_customer_own_domain: toNumber(r.is_customer_own_domain) || 0,
    is_domain_available: toNumber(r.is_domain_available) || 0,
    stripe_token: dbEscape(r.stripe_token) || "",
    stripe_customer_id: dbEscape(r.stripe_customer_id) || "",
    stripe_plan_id: dbEscape(r.stripe_plan_id) || "",
    recurring_billing: toNumber(r.recurring_billing) || 0,
    recurring_billing_id: dbEscape(r.recurring_billing_id) || "",
    stripe_payment_intent_id: dbEscape(r.stripe_payment_intent_id) || "",
    start_date: dbEscape(r.start_date) || "",
    end_date: dbEscape(r.end_date) || "",
    affiliate_status_id: toNumber(r.affiliate_status_id) || 0,
    affiliate_status: dbEscape(r.affiliate_status) || "",
    date_added: dbEscape(r.date_added) || "",
    date_modified: dbEscape(r.date_modified) || "",
  };
}