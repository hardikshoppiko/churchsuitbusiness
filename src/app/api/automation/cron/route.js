// /src/app/api/automation/cron/route.js
export const runtime = "nodejs";

import { db } from "@/lib/db";

/**
 * CRON automation sender
 *
 * Features:
 * - processCron('lead'), processCron('pending_payment') ... runs one by one
 * - status_code -> affiliate_status_id lookup from affiliate_status table
 * - last_activity = MAX(affiliate_activity.date_added) fallback affiliate.date_added
 * - Per-rule cooldown: affiliate_automation_rule.cooldown_minutes
 * - Prevent burst: send ONLY ONE message per affiliate per channel per cron run
 * - Insert send_log only after send success
 */

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// ==========================
// Placeholder replace
// ==========================
function applyPlaceholders(str = "", vars = {}) {
  let out = String(str || "");
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, String(v ?? ""));
  }
  return out;
}

function nowMs() {
  return Date.now();
}

// ==========================
// SENDERS (Replace later with SendGrid/Twilio)
// Must return truthy object on success, else null/false
// ==========================
async function sendEmail({ to, subject, html }) {
  console.log(`html: ${html}`);
  console.log("EMAIL SEND:", { to, subject });
  // TODO integrate SendGrid here
  return { provider: "stub", provider_message_id: `email_${Date.now()}` };
}

async function sendSms({ to, text }) {
  console.log("SMS SEND:", { to, text });
  // TODO integrate Twilio here
  return null; // keep null until SMS enabled
}

// ==========================
// Helpers
// ==========================
async function getStatusIdByCode(statusCode) {
  const code = String(statusCode || "").trim();
  if (!code) return null;

  const [rows] = await db.query(`SELECT affiliate_status_id FROM affiliate_status WHERE code=? AND status=1 LIMIT 1`, [code]);

  return rows?.[0]?.affiliate_status_id ? Number(rows[0].affiliate_status_id) : null;
}

/**
 * Get last activity time for affiliates (bulk).
 */
async function getLastActivityMap(affiliateIds = []) {
  const map = new Map();
  const ids = affiliateIds.map((id) => Number(id)).filter(Boolean);
  if (!ids.length) return map;

  const idsCsv = ids.join(",");

  const [rows] = await db.query(`SELECT a.affiliate_id, MAX(a.date_added) AS last_activity FROM affiliate_activity a WHERE a.affiliate_id IN (${idsCsv}) GROUP BY a.affiliate_id`);

  for (const r of rows || []) {
    if (r?.affiliate_id) map.set(Number(r.affiliate_id), r.last_activity);
  }

  return map;
}

/**
 * Get last sent time per affiliate+channel (bulk) so we can apply cooldown
 */
async function getLastSentAtMap(affiliateIds = []) {
  const map = new Map();
  const ids = affiliateIds.map((id) => Number(id)).filter(Boolean);
  if (!ids.length) return map;

  const idsCsv = ids.join(",");

  const [rows] = await db.query(`SELECT affiliate_id, channel, MAX(sent_at) AS last_sent_at FROM affiliate_automation_send_log WHERE affiliate_id IN (${idsCsv}) GROUP BY affiliate_id, channel`);

  for (const r of rows || []) {
    const k = `${Number(r.affiliate_id)}:${String(r.channel)}`;
    map.set(k, r.last_sent_at);
  }

  return map;
}

/**
 * Check if already sent exact rule for (affiliate_id, rule_id, channel)
 */
async function alreadySent({ affiliate_id, rule_id, channel }) {
  const [rows] = await db.query(`SELECT send_log_id FROM affiliate_automation_send_log WHERE affiliate_id=? AND rule_id=? AND channel=? LIMIT 1`, [Number(affiliate_id), Number(rule_id), String(channel)]);

  return !!rows?.length;
}

/**
 * Insert send log only after successful send
 */
async function insertSendLog({affiliate_id, rule_id, template_code, cohort, channel, dueAtMs, provider_message_id = "" }) {
  // store due_at as datetime
  const dueAtSql = `FROM_UNIXTIME(${Math.floor(Number(dueAtMs) / 1000)})`;

  await db.query(`INSERT INTO affiliate_automation_send_log (affiliate_id, rule_id, template_code, cohort, channel, due_at, sent_at, provider_message_id, date_added) VALUES ('${Number(affiliate_id)}', '${Number(rule_id)}', '${String(template_code)}', '${String(cohort)}', '${String(channel)}', ${dueAtSql}, NOW(), '${String(provider_message_id || "")}', NOW())`);
}

/**
 * Pick ONLY ONE eligible rule per channel.
 * ✅ MUST follow sort_order first (email/sms send in sort_order sequence)
 * - eligible = due and not already sent and template exists and contact exists
 */
function pickOneRulePerChannel(eligibleRules = []) {
  const best = new Map(); // channel -> rule

  // ✅ sort by sort_order first, then delay_minutes as tie-breaker
  const sorted = [...eligibleRules].sort((a, b) => {
    const sa = Number(a.sort_order || 0);
    const sb = Number(b.sort_order || 0);
    if (sa !== sb) return sa - sb;

    const da = Number(a.delay_minutes || 0);
    const db = Number(b.delay_minutes || 0);
    return da - db;
  });

  for (const r of sorted) {
    const ch = String(r.channel);
    if (!best.has(ch)) best.set(ch, r);
  }

  return Array.from(best.values());
}

// ==========================
// Main processor
// ==========================
async function processCron(statusCode) {
  const startedAt = nowMs();

  const affiliate_status_id = await getStatusIdByCode(statusCode);
  if (!affiliate_status_id) {
    return {
      ok: false,
      cohort: statusCode,
      message: `Invalid status code: ${statusCode}`,
      took_ms: nowMs() - startedAt,
    };
  }

  // 1) load active rules for this cohort (cohort column must match statusCode)
  const [rules] = await db.query(`SELECT * FROM affiliate_automation_rule WHERE status=1 AND cohort=? ORDER BY delay_minutes ASC, sort_order ASC`, [String(statusCode)]);

  if (!rules?.length) {
    return {
      ok: true,
      cohort: statusCode,
      message: "No rules found",
      took_ms: nowMs() - startedAt,
      totals: { affiliates: 0, rules: 0 },
    };
  }

  // 2) load affiliates with this status id (your lead=15, pending_payment=5, etc.)
  const [affiliates] = await db.query(`SELECT affiliate_id, firstname, lastname, email, telephone, date_added, affiliate_status_id, stop_automation, status, is_delete FROM affiliate WHERE affiliate_status_id=${Number(affiliate_status_id)} AND is_delete=0 ORDER BY affiliate_id DESC LIMIT 500`);

  if (!affiliates?.length) {
    return {
      ok: true,
      cohort: statusCode,
      message: "No affiliates found",
      took_ms: nowMs() - startedAt,
      totals: { affiliates: 0, rules: rules.length },
    };
  }

  const affIds = affiliates.map((a) => Number(a.affiliate_id)).filter(Boolean);

  // 3) last_activity map
  const lastActivityMap = await getLastActivityMap(affIds);

  // 4) last_sent map (cooldown)
  const lastSentAtMap = await getLastSentAtMap(affIds);

  // 5) load templates used by rules
  const templateCodes = Array.from(
    new Set(rules.map((r) => String(r.template_code || "")).filter(Boolean))
  );

  const templateByKey = new Map();
  if (templateCodes.length) {
    const codesSql = templateCodes.map((c) => `'${c.replaceAll("'", "''")}'`).join(",");

    const [tpls] = await db.query(`SELECT * FROM affiliate_automation_template WHERE status=1 AND code IN (${codesSql})`);

    for (const t of tpls || []) {
      templateByKey.set(`${t.code}:${t.channel}`, t);
    }
  }

  // totals
  const totals = {
    affiliates: affiliates.length,
    rules: rules.length,
    checked: 0,

    sentEmail: 0,
    sentSms: 0,

    skippedNotDue: 0,
    skippedAlreadySent: 0,
    skippedNoTemplate: 0,
    skippedNoContact: 0,
    skippedCooldown: 0,
    failedSend: 0,
  };

  const now = nowMs();

  // 6) per affiliate processing
  for (const aff of affiliates) {
    const affiliate_id = Number(aff.affiliate_id);

    if (!affiliate_id) {
      continue;
    }

    const lastActivity = lastActivityMap.get(affiliate_id) || aff.date_added;

    const lastActivityMs = lastActivity ? new Date(lastActivity).getTime() : 0;

    if (!lastActivityMs) {
      continue;
    }

    const payment_url = `${APP_URL}/register/payment/${affiliate_id}`;

    const vars = {
      affiliate_id,
      firstname: aff.firstname || "",
      lastname: aff.lastname || "",
      email: aff.email || "",
      telephone: aff.telephone || "",
      payment_url,
      short_payment_url: payment_url,
    };

    // Build eligible rules first (due + not already sent + template exists + contact exists)
    const eligible = [];

    for (const rule of rules) {
      totals.checked++;

      const rule_id = Number(rule.rule_id);
      const channel = String(rule.channel);
      const template_code = String(rule.template_code);
      const cohort = String(rule.cohort);

      // compute dueAt
      const delayMin = Number(rule.delay_minutes || 0);
      const dueAtMs = lastActivityMs + delayMin * 60 * 1000;

      // not due (only enforce in prod)
      if (!IS_DEVELOPMENT && now < dueAtMs) {
        totals.skippedNotDue++;
        continue;
      }

      // already sent this rule
      const sentBefore = await alreadySent({ affiliate_id, rule_id, channel });

      if (sentBefore) {
        totals.skippedAlreadySent++;
        continue;
      }

      // template exists?
      const tpl = templateByKey.get(`${template_code}:${channel}`);
      
      if (!tpl) {
        totals.skippedNoTemplate++;
        continue;
      }

      // contact check
      if (channel === "email" && !String(aff.email || "").trim()) {
        totals.skippedNoContact++;
        continue;
      }
      if (channel === "sms" && !String(aff.telephone || "").trim()) {
        totals.skippedNoContact++;
        continue;
      }

      eligible.push({
        ...rule,
        _dueAtMs: dueAtMs,
        _tpl: tpl,
        _cohort: cohort,
      });
    }

    // ✅ prevent burst: pick 1 rule per channel (email + sms max 2 sends per affiliate per cron run)
    const picked = pickOneRulePerChannel(eligible);

    for (const rule of picked) {
      const rule_id = Number(rule.rule_id);
      const channel = String(rule.channel);
      const template_code = String(rule.template_code);
      const dueAtMs = Number(rule._dueAtMs);
      const tpl = rule._tpl;

      // ✅ per-rule cooldown
      const cooldownMin = Number(rule.cooldown_minutes || 0);
      const cooldownMs = cooldownMin * 60 * 1000;

      if (!IS_DEVELOPMENT && cooldownMs > 0) {
        const k = `${affiliate_id}:${channel}`;
        const lastSentAt = lastSentAtMap.get(k);

        if (lastSentAt) {
          const lastSentMs = new Date(lastSentAt).getTime();
          if (lastSentMs && now < lastSentMs + cooldownMs) {
            totals.skippedCooldown++;
            continue;
          }
        }
      }

      // render
      const subject = applyPlaceholders(tpl.subject || "", vars);
      const body = applyPlaceholders(tpl.body || "", vars);

      // send
      let providerResult = null;
      try {
        if (channel === "email") {
          providerResult = await sendEmail({
            to: aff.email,
            subject,
            html: body,
          });
        } else if (channel === "sms") {
          providerResult = await sendSms({
            to: aff.telephone,
            text: body,
          });
        }
      } catch (e) {
        console.log("Send exception:", e?.message);
        providerResult = null;
      }

      if (providerResult) {
        await insertSendLog({
          affiliate_id,
          rule_id,
          template_code,
          cohort: rule._cohort || statusCode,
          channel,
          dueAtMs,
          provider_message_id: providerResult?.provider_message_id || "",
        });

        // update cooldown map instantly (so if there are multiple picked rules, it still respects next checks)
        lastSentAtMap.set(`${affiliate_id}:${channel}`, new Date().toISOString());

        if (channel === "email") {
          totals.sentEmail++;
        }

        if (channel === "sms") {
          totals.sentSms++;
        }
      } else {
        totals.failedSend++;
      }
    }
  }

  return {
    ok: true,
    cohort: statusCode,
    affiliate_status_id,
    totals,
    took_ms: nowMs() - startedAt,
  };
}

// ==========================
// API handler
// ==========================
export async function GET(req) {
  const startedAt = nowMs();

  // ✅ Run cohorts one by one
  const results = [];
  results.push(await processCron("lead"));
  results.push(await processCron("pending_payment")); // your status table code: pending_payment

  return Response.json({
    ok: true,
    ran: results.map((r) => r.cohort),
    results,
    took_ms: nowMs() - startedAt,
  });
}