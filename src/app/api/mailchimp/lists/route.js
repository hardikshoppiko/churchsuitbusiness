export const runtime = "nodejs";

import { jsonOK, jsonErr, mailchimpFetch } from "../_utils";

export async function GET() {
  try {
    // Fetch lists (audiences)
    const r = await mailchimpFetch("/lists?count=1000&offset=0");

    if (!r.ok) {
      return jsonErr("Failed to fetch audiences", r.status, r.details);
    }

    const lists = Array.isArray(r.data?.lists) ? r.data.lists : [];

    const audiences = lists.map((l) => ({
      id: l.id,
      name: l.name,
      member_count: l.stats?.member_count ?? null,
      unsubscribe_count: l.stats?.unsubscribe_count ?? null,
      cleaned_count: l.stats?.cleaned_count ?? null,
      created_at: l.date_created ?? null,
    }));

    return jsonOK({
      audiences,
      total_items: r.data?.total_items ?? audiences.length,
    });
  } catch (e) {
    return jsonErr(e?.message || "Server error", 500);
  }
}