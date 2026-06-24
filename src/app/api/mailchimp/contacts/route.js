export const runtime = "nodejs";

import { jsonOK, jsonErr, mailchimpFetch } from "../_utils";

/**
 * GET /api/mailchimp/contacts?audience_id=LIST_ID
 * GET /api/mailchimp/contacts?audience_id=LIST_ID&status=subscribed
 * GET /api/mailchimp/contacts?audience_id=LIST_ID&count=1000&offset=0
 */

const ALLOWED_STATUSES = new Set([
  "subscribed",
  "unsubscribed",
  "cleaned",
  "pending",
  "transactional",
]);

function parseCount(searchParams) {
  const raw = Number(searchParams.get("count") || 1000);

  if (!Number.isFinite(raw) || raw <= 0) {
    return 1000;
  }

  return Math.min(raw, 1000);
}

function parseOffset(searchParams) {
  const raw = Number(searchParams.get("offset") || 0);

  if (!Number.isFinite(raw) || raw < 0) {
    return 0;
  }

  return raw;
}

function parseStatus(searchParams) {
  const raw = String(searchParams.get("status") || "").trim().toLowerCase();

  if (!raw) {
    return "";
  }

  if (!ALLOWED_STATUSES.has(raw)) {
    return null;
  }

  return raw;
}

function getMergeValue(mergeFields, keys = []) {
  for (const key of keys) {
    const value = mergeFields?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const audience_id = String(searchParams.get("audience_id") || "").trim();
    const count = parseCount(searchParams);
    const offset = parseOffset(searchParams);
    const status = parseStatus(searchParams);

    if (!audience_id) {
      return jsonErr("audience_id is required", 400);
    }

    if (status === null) {
      return jsonErr(
        "Invalid status. Allowed: subscribed, unsubscribed, cleaned, pending, transactional",
        400
      );
    }

    const qs = new URLSearchParams();
    qs.set("count", String(count));
    qs.set("offset", String(offset));

    if (status) {
      qs.set("status", status);
    }

    const r = await mailchimpFetch(
      `/lists/${encodeURIComponent(audience_id)}/members?${qs.toString()}`
    );

    if (!r.ok) {
      return jsonErr("Failed to fetch contacts", r.status, r.details);
    }

    const members = Array.isArray(r.data?.members) ? r.data.members : [];

    const contacts = members.map((m) => {
      const mergeFields = m.merge_fields || {};

      const first_name = getMergeValue(mergeFields, [
        "FNAME",
        "FIRSTNAME",
        "FIRST_NAME",
      ]);

      const last_name = getMergeValue(mergeFields, [
        "LNAME",
        "LASTNAME",
        "LAST_NAME",
      ]);

      const telephone = getMergeValue(mergeFields, [
        "PHONE",
        "PHONENUMBER",
        "MOBILE",
      ]);

      const full_name = `${first_name} ${last_name}`.trim();

      return {
        id: m.id ?? null,
        audience_id: audience_id,
        email: m.email_address ?? null,
        status: m.status ?? null,
        full_name: full_name || null,
        first_name: first_name || null,
        last_name: last_name || null,
        telephone: telephone || null,
        unique_email_id: m.unique_email_id ?? null,
        contact_id: m.contact_id ?? null,
        member_rating: m.member_rating ?? null,
        email_type: m.email_type ?? null,
        vip: m.vip ?? false,
        last_changed: m.last_changed ?? null,
      };
    });

    return jsonOK({
      audience_id,
      status: status || "all",
      contacts,
      total_items: r.data?.total_items ?? contacts.length,
      count,
      offset,
    });
  } catch (e) {
    return jsonErr(e?.message || "Server error", 500);
  }
}