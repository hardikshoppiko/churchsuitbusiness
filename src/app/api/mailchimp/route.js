export const runtime = "nodejs";

import { jsonOK, jsonErr, mailchimpFetch } from "./_utils";

export async function GET() {
  try {
    const r = await mailchimpFetch("/ping");

    if (!r.ok) {
      return jsonErr("Mailchimp ping failed", r.status, r.details);
    }

    return jsonOK({ data: r.data });
  } catch (e) {
    return jsonErr(e?.message || "Server error", 500);
  }
}