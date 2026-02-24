export const runtime = "nodejs";

import { formatDate } from "@/lib/db-utils";
import { jsonOK, jsonErr, mailchimpFetch } from "../_utils";

function toInt(v, def = 0) {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : def;
}

function isTruthy(v) {
  const s = String(v || "").toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const campaignId = searchParams.get("id");

    const includeContent = isTruthy(searchParams.get("include_content")) || isTruthy(searchParams.get("include_html")); // provide content
    const contentMode = (searchParams.get("content_mode") || "all").toLowerCase(); // all|html
    const returnMode = (searchParams.get("return") || "json").toLowerCase(); // json|html, in html mode, return raw HTML instead of JSON (for direct rendering)

    const defaultCount = 100;

    const sort = (searchParams.get("sort") || "desc").toLowerCase();

    //  Single campaign
    if (campaignId) {
      const r = await mailchimpFetch(`/campaigns/${encodeURIComponent(campaignId)}`);

      if (!r.ok) {
        return jsonErr("Failed to fetch campaign", r.status, r.details);
      }

      const c = r.data;

      const campaign = {
        id: c.id,
        web_id: c.web_id ?? null,
        type: c.type ?? null,
        status: c.status ?? null,

        create_time: c.create_time ? formatDate(c.create_time, "MM/DD/YYYY HH:mm:ss") : null,
        send_time: c.send_time ? formatDate(c.send_time, "MM/DD/YYYY HH:mm:ss") : null,

        title: c.settings?.title ?? null,
        subject_line: c.settings?.subject_line ?? null,
        preview_text: c.settings?.preview_text ?? null,
        from_name: c.settings?.from_name ?? null,
        reply_to: c.settings?.reply_to ?? null,

        list_id: c.recipients?.list_id ?? null,
        recipient_count: c.recipients?.recipient_count ?? null,

        archive_url: c.archive_url ?? null,
        long_archive_url: c.long_archive_url ?? null,
      };

      //  include campaign content (HTML/plain/archive)
      if (includeContent) {
        const r2 = await mailchimpFetch(`/campaigns/${encodeURIComponent(campaignId)}/content`);

        if (!r2.ok) {
          return jsonErr("Failed to fetch campaign content", r2.status, r2.details);
        }

        const html = r2.data?.html ?? null;
        const plain_text = r2.data?.plain_text ?? null;
        const archive_html = r2.data?.archive_html ?? null;

        //  NEW: return raw HTML when requested
        // Use: /api/mailchimp/campaigns?id=XXX&include_content=1&content_mode=html&return=html
        if (returnMode === "html" && contentMode === "html") {
          return new Response(html || "", {
            status: 200,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "no-store",
            },
          });
        }

        // otherwise JSON response
        const content =
          contentMode === "html"
            ? { html }
            : {
                html,
                plain_text,
                archive_html,
              };

        return jsonOK({ campaign, content });
      }

      return jsonOK({ campaign });
    }

    //  Paginated list
    const count = Math.min(Math.max(toInt(searchParams.get("count"), defaultCount), 1), 1000);
    const offset = Math.max(toInt(searchParams.get("offset"), 0), 0);

    const status = (searchParams.get("status") || "").trim(); // "save", "paused", "schedule", "sending", "sent"
    const type = (searchParams.get("type") || "").trim(); // "regular", "plaintext", "absplit", "rss", "variate"

    const qs = new URLSearchParams();
    qs.set("count", String(count));
    qs.set("offset", String(offset));

    if (status) {
      qs.set("status", status);
    }

    if (type) {
      qs.set("type", type);
    }

    //  Proper Mailchimp sorting (server-side)
    qs.set("sort_field", "create_time");
    qs.set("sort_dir", sort === "asc" ? "ASC" : "DESC");

    const r = await mailchimpFetch(`/campaigns?${qs.toString()}`);

    if (!r.ok) {
      return jsonErr("Failed to fetch campaigns", r.status, r.details);
    }

    const campaigns = Array.isArray(r.data?.campaigns) ? r.data.campaigns : [];
    const totalItems = Number(r.data?.total_items ?? 0);

    console.log("Campaign response:", campaigns);

    return jsonOK({
      paging: {
        count,
        offset,
        total_items: totalItems,
        has_more: offset + campaigns.length < totalItems,
        next_offset: offset + campaigns.length,
      },

      sort: {
        sort_field: "create_time",
        sort_dir: sort === "asc" ? "ASC" : "DESC",
      },
      campaigns: campaigns.map((c, index) => ({
        counter: offset + index + 1,
        id: c.id,
        web_id: c.web_id ?? null,
        status: c.status ?? null,
        type: c.type ?? null,
        title: c.settings?.title ?? null,
        subject_line: c.settings?.subject_line ?? null,
        preview_text: c.settings?.preview_text ?? null,
        list_id: c.recipients?.list_id ?? null,
        recipient_count: c.recipients?.recipient_count ?? null,
        created_at: c.create_time ? formatDate(c.create_time, "MM/DD/YYYY HH:mm:ss") : null,
        send_time: c.send_time ? formatDate(c.send_time, "MM/DD/YYYY HH:mm:ss") : null,
      })),
    });
  } catch (e) {
    return jsonErr(e?.message || "Server error", 500);
  }
}