// /api/mailchimp/templates            --> fetch all templates (auto-pagination)
// /api/mailchimp/templates?id=600      --> fetch single template meta
// /api/mailchimp/templates?id=600&html=1 --> fetch single template meta + HTML

export const runtime = "nodejs";

import { formatDate } from "@/lib/db-utils";
import { jsonOK, jsonErr, mailchimpFetch, mailchimpFetchAll } from "../_utils";

function toBool(v) {
  const s = String(v || "").toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const templateIdRaw = searchParams.get("id");
    const includeHtml = toBool(searchParams.get("html"));

    // -----------------------------
    // Fetch single template
    // -----------------------------
    if (templateIdRaw) {
      const templateId = String(templateIdRaw).trim();

      const r = await mailchimpFetch(`/templates/${templateId}`);

      if (!r.ok) {
        return jsonErr("Failed to fetch template", r.status, r.details);
      }

      const t = r.data || {};

      // Optional "default content" (NOT full html)
      let default_content = null;

      if (includeHtml) {
        const r2 = await mailchimpFetch(`/templates/${templateId}/default-content`);

        console.log("Default content response:", r2);

        if (!r2.ok) {
          return jsonErr("Failed to fetch template default content", r2.status, r2.details);
        }

        // Mailchimp returns editable sections + default values
        default_content = {
          // sometimes Mailchimp returns an object; sometimes array-ish, keep it flexible
          sections: r2?.data?.sections ?? null,
          // keep html only if it exists (usually it does NOT)
          html: r2?.data?.html ?? null,
        };
      }

      return jsonOK({
        template: {
          id: t.id,
          name: t.name,
          type: t.type,
          content_type: t.content_type,
          drag_and_drop: t.drag_and_drop,
          responsive: t.responsive,
          active: t.active,
          thumbnail: t.thumbnail || null,
          created_at: t.date_created ? formatDate(t.date_created, "MM/DD/YYYY HH:mm:ss") : null,
          updated_at: t.date_edited ? formatDate(t.date_edited, "MM/DD/YYYY HH:mm:ss") : null,
          default_content
        },
      });
    }

    // -----------------------------
    // Fetch all templates (auto-pagination)
    // -----------------------------
    const r = await mailchimpFetchAll(`/templates`);

    if (!r.ok) {
      return jsonErr("Failed to fetch templates", r.status, r.details);
    }

    const list = Array.isArray(r.data) ? r.data : Array.isArray(r.data?.templates) ? r.data.templates : [];

    return jsonOK({
      templates: list.map((t, index) => ({
        counter: index + 1,
        id: t.id,
        name: t.name,
        type: t.type,
        content_type: t.content_type || null,
        active: typeof t.active === "boolean" ? t.active : null,
        thumbnail: t.thumbnail || null,
        created_at: t.date_created ? formatDate(t.date_created, "MM/DD/YYYY") : null,
      })),
      total_items: list.length,
    });
  } catch (e) {
    return jsonErr(e?.message || "Server error", 500);
  }
}