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


// ==========================
// POST: Create DRAFT campaign(s)
// ==========================
// Body JSON:
// {
//   "subject": "....",
//   "preview_text": "....",
//   "template_id": 600,
//   "audiences": "dd1608dec2,ABC003"   // OR array ["dd1608dec2","ABC003"]
//   // optional:
//   // "title": "My Draft Campaign Title"
//   // "from_name": "Your Brand"   (or set MAILCHIMP_FROM_NAME in env)
//   // "reply_to": "support@domain.com" (or set MAILCHIMP_REPLY_TO in env)
// }

// ==========================
// Below are the senario of create, sending or scheduling mailchimp template.
// ==========================
// A) Create draft only
// {
//   "action": "create",
//   "subject": "Hello",
//   "preview_text": "Preview",
//   "template_id": 600,
//   "audiences": "dd1608dec2"
// }

// B) Create + send now
// {
//   "action": "create_send",
//   "subject": "Hello",
//   "preview_text": "Preview",
//   "template_id": 600,
//   "audiences": "dd1608dec2"
// }

// C) Send existing campaign
// {
//   "action": "send",
//   "campaign_id": "a1b2c3d4"
// }

// D) Schedule existing campaign
// {
//   "action": "schedule",
//   "campaign_id": "a1b2c3d4",
//   "schedule_time": "2026-02-26T18:30:00+05:30"
// }


function splitCsv(v = "") {
  return String(v || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function cleanStr(v) {
  return String(v ?? "").trim();
}

function isAction(v, name) {
  return cleanStr(v).toLowerCase() === name;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const action = cleanStr(body?.action || "create").toLowerCase();

    console.log(body);
    console.log(action);
    // return false;

    // ==========================
    // SEND existing campaign
    // ==========================
    if (isAction(action, "send")) {
      const campaign_id = cleanStr(body?.campaign_id);

      if (!campaign_id) {
        return jsonErr("campaign_id is required for send", 400);
      }

      const r = await mailchimpFetch(`/campaigns/${encodeURIComponent(campaign_id)}/actions/send`, { method: "POST" });

      if (!r.ok) {
        return jsonErr("Failed to send campaign", r.status, r.details);
      }

      return jsonOK({ message: "Campaign send triggered", campaign_id });
    }

    // ==========================
    // SCHEDULE existing campaign
    // ==========================
    if (isAction(action, "schedule")) {
      const campaign_id = cleanStr(body?.campaign_id);
      const schedule_time = cleanStr(body?.schedule_time); // ISO string with timezone preferred

      if (!campaign_id) {
        return jsonErr("campaign_id is required for schedule", 400);
      }

      if (!schedule_time) {
        return jsonErr("schedule_time is required (ISO string)", 400);
      }

      const r = await mailchimpFetch(`/campaigns/${encodeURIComponent(campaign_id)}/actions/schedule`, { method: "POST", body: { schedule_time } });

      if (!r.ok) {
        return jsonErr("Failed to schedule campaign", r.status, r.details);
      }

      return jsonOK({ message: "Campaign scheduled", campaign_id, schedule_time });
    }

    // ==========================
    // CREATE (draft) campaign(s)
    // action: create | create_send | create_schedule
    // ==========================
    const subject_line = cleanStr(body?.subject || body?.subject_line);
    const preview_text = cleanStr(body?.preview_text);
    const template_id = body?.template_id ? Number(body.template_id) : null;

    const audiencesRaw = Array.isArray(body?.audiences) ? body.audiences.join(",") : (body?.audiences || body?.list_ids || "");

    const listIds = splitCsv(audiencesRaw);

    if (!subject_line) {
      return jsonErr("subject is required", 400);
    }

    if (!listIds.length) {
      return jsonErr("audiences (comma separated) is required", 400);
    }

    const from_name = cleanStr(body?.from_name || process.env.MAILCHIMP_FROM_NAME || "");
    const reply_to = cleanStr(body?.reply_to || process.env.MAILCHIMP_REPLY_TO || "");

    if (!from_name) {
      return jsonErr("from_name missing (send in body or set MAILCHIMP_FROM_NAME)", 400);
    }

    if (!reply_to) {
      return jsonErr("reply_to missing (send in body or set MAILCHIMP_REPLY_TO)", 400);
    }

    const title = cleanStr(body?.title) || `Draft - ${subject_line}`.slice(0, 100);

    // optional: schedule after create
    const schedule_time = cleanStr(body?.schedule_time);

    const created = [];

    for (const list_id of listIds) {
      // 1) Create campaign (draft)
      const payload = {
        type: "regular",
        recipients: { list_id },
        settings: {
          title,
          subject_line,
          preview_text: preview_text || "",
          from_name,
          reply_to,
        },
      };

      const r = await mailchimpFetch(`/campaigns`, { method: "POST", body: payload });

      if (!r.ok) {
        return jsonErr(`Failed to create draft campaign for audience ${list_id}`, r.status, r.details);
      }

      const campaign_id = r.data?.id || null;
      const web_id = r.data?.web_id || null;

      if (!campaign_id) {
        return jsonErr(`Campaign created but missing id for audience ${list_id}`, 500);
      }

      // 2) Attach template (content)
      if (template_id) {
        const r2 = await mailchimpFetch(`/campaigns/${encodeURIComponent(campaign_id)}/content`, {
          method: "PUT",
          body: { template: { id: template_id } },
        });

        if (!r2.ok) {
          return jsonErr(`Campaign created but failed to attach template for audience ${list_id}`, r2.status, r2.details);
        }
      }

      // 3) Optional: send now
      if (isAction(action, "create_send")) {
        const r3 = await mailchimpFetch(`/campaigns/${encodeURIComponent(campaign_id)}/actions/send`, {
          method: "POST",
        });

        if (!r3.ok) {
          return jsonErr(`Campaign created but failed to send for audience ${list_id}`, r3.status, r3.details);
        }
      }

      // 4) Optional: schedule
      if (isAction(action, "create_schedule")) {
        if (!schedule_time) return jsonErr("schedule_time required for create_schedule", 400);

        const r4 = await mailchimpFetch(`/campaigns/${encodeURIComponent(campaign_id)}/actions/schedule`, {
          method: "POST",
          body: { schedule_time },
        });

        if (!r4.ok) {
          return jsonErr(`Campaign created but failed to schedule for audience ${list_id}`, r4.status, r4.details);
        }
      }

      created.push({
        list_id,
        campaign_id,
        web_id,
        status: isAction(action, "create_send")
          ? "sending"
          : isAction(action, "create_schedule")
          ? "schedule"
          : (r.data?.status || "save"),
        template_id: template_id || null,
      });
    }

    return jsonOK({
      message: "Campaign operation completed",
      action,
      created_count: created.length,
      campaigns: created,
      campaign_id: created.length === 1 ? created[0].campaign_id : null,
      web_id: created.length === 1 ? created[0].web_id : null,
    });
  } catch (e) {
    return jsonErr(e?.message || "Server error", 500);
  }
}

// For Delete campaign
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Allow both: /api/mailchimp/campaigns?id=XXX  OR  /api/mailchimp/campaigns?campaign_id=XXX
    const campaignId = String(searchParams.get("id") || searchParams.get("campaign_id") || "").trim();

    if (!campaignId) {
      return jsonErr("Missing campaign id. Use /api/mailchimp/campaigns?id=XXXX", 400);
    }

    const r = await mailchimpFetch(`/campaigns/${encodeURIComponent(campaignId)}`, { method: "DELETE" });

    if (!r.ok) {
      return jsonErr("Failed to delete campaign", r.status || 500, r.details || null);
    }

    // Mailchimp usually returns 204 No Content for delete (no JSON body)
    return jsonOK({
      message: "Campaign deleted successfully",
      campaign_id: campaignId,
    });
  } catch (e) {
    return jsonErr(e?.message || "Server error", 500);
  }
}