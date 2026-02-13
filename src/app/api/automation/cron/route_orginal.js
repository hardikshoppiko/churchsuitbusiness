// /src/app/api/automation/cron/route.js
export const runtime = "nodejs";

import { db } from "@/lib/db";

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

// ==========================
// SENDERS (stubs)
// Replace with SendGrid/Twilio later
// Must return truthy object on success, else null
// ==========================
async function sendEmail({ to, subject, html }) {
  console.log(`html: ${html}`);
  console.log("EMAIL SEND:", { to, subject });
  return { provider: "stub", provider_message_id: `email_${Date.now()}` };
}

async function sendSms({ to, text }) {
  console.log("SMS SEND:", { to, text });
  return null; // keep null until SMS enabled (so it won't log)
}

// ==========================
// Helpers
// ==========================
function nowMs() {
  return Date.now();
}

async function getLastActivityMap(affiliateIds = []) {
  const ids = affiliateIds.map((x) => Number(x)).filter(Boolean);

  if (!ids.length) {
    return new Map();
  }

  const placeholders = ids.map(() => "?").join(",");

  const [rows] = await db.query(`SELECT a.affiliate_id, MAX(a.date_added) AS last_activity FROM affiliate_activity a WHERE a.affiliate_id IN (${placeholders}) GROUP BY a.affiliate_id`, ids);

  const map = new Map();

  for (const r of rows || []) {
    if (r?.affiliate_id) map.set(Number(r.affiliate_id), r.last_activity);
  }

  return map;
}

/**
 * Prefetch logs for this cohort run.
 * returns Set of `${affiliate_id}:${rule_id}:${channel}`
 */
async function getAlreadySentSet({ affiliateIds = [], ruleIds = [] }) {
  const aIds = affiliateIds.map((x) => Number(x)).filter(Boolean);

  const rIds = ruleIds.map((x) => Number(x)).filter(Boolean);

  if (!aIds.length || !rIds.length) {
    return new Set();
  }

  const aPH = aIds.map(() => "?").join(",");
  const rPH = rIds.map(() => "?").join(",");

  const [rows] = await db.query(`SELECT affiliate_id, rule_id, channel FROM affiliate_automation_send_log WHERE affiliate_id IN (${aPH}) AND rule_id IN (${rPH})`, [...aIds, ...rIds]);

  const sent = new Set();

  for (const r of rows || []) {
    sent.add(`${Number(r.affiliate_id)}:${Number(r.rule_id)}:${String(r.channel)}`);
  }

  return sent;
}

async function insertSendLog({
  affiliate_id,
  rule_id,
  template_code,
  cohort,
  channel,
  dueAtMs,
  provider_message_id = "",
}) {
  await db.query(`INSERT INTO affiliate_automation_send_log (affiliate_id, rule_id, template_code, cohort, channel, due_at, sent_at, provider_message_id, date_added) VALUES (?, ?, ?, ?, ?, FROM_UNIXTIME(?), NOW(), ?, NOW())`,
    [
      Number(affiliate_id),
      Number(rule_id),
      String(template_code),
      String(cohort),
      String(channel),
      Math.floor(Number(dueAtMs) / 1000),
      String(provider_message_id || ""),
    ]
  );
}

// =====================================================
// ✅ MAIN FUNCTION YOU WANTED: processCron("lead")
// =====================================================
async function processCron(cohort) {
  const startedAt = nowMs();
  const cohortKey = String(cohort || "").trim();

  const result = {
    cohort: cohortKey,
    took_ms: 0,
    totals: {
      rules: 0,
      affiliates: 0,
      checked: 0,
      sentEmail: 0,
      sentSms: 0,
      skippedAlreadySent: 0,
      skippedNotDue: 0,
      skippedNoTemplate: 0,
      skippedNoContact: 0,
      failedSend: 0,
    },
  };

  if (!cohortKey) {
    result.took_ms = nowMs() - startedAt;
    return result;
  }

  // 1) Load active rules for this cohort
  // NOTE: cohort column is varchar, your sample uses 'lead'
  const [rules] = await db.query(`SELECT * FROM affiliate_automation_rule WHERE status=1 AND cohort=? ORDER BY status_id ASC, delay_minutes ASC, sort_order ASC`, [cohortKey]);

  // console.log(`Found ${rules?.length || 0} active rules for cohort '${cohortKey}'`); return false;

  if (!rules?.length) {
    result.took_ms = nowMs() - startedAt;

    return result;
  }

  result.totals.rules = rules.length;

  // 2) Load templates used by rules (code + channel)
  const templateCodes = Array.from(new Set(rules.map((r) => String(r.template_code || "")).filter(Boolean)));

  const templateByKey = new Map(); // `${code}:${channel}`

  if (templateCodes.length) {
    const codesPH = templateCodes.map(() => "?").join(",");

    const [tpls] = await db.query(`SELECT * FROM affiliate_automation_template WHERE status=1 AND cohort=? AND code IN (${codesPH})`, [cohortKey, ...templateCodes]);

    for (const t of tpls || []) {
      templateByKey.set(`${t.code}:${t.channel}`, t);
    }
  }

  // 3) For THIS cohort, rules can point to different status_id (affiliate_status_id)
  const statusIds = Array.from(new Set(rules.map((r) => Number(r.status_id || 0)).filter(Boolean)));

  // console.log(`Status IDs to process for cohort '${cohortKey}':`, statusIds); return false;

  // 4) Process each status_id one by one (still within cohort)
  const now = nowMs();

  for (const statusId of statusIds) {
    // 4.1) affiliates matching this status_id
    const [affiliates] = await db.query(`SELECT affiliate_id, firstname, lastname, email, telephone, date_added, affiliate_status_id, status FROM affiliate WHERE affiliate_status_id=? AND is_delete=0 ORDER BY affiliate_id DESC LIMIT 500`, [Number(statusId)]);

    // console.log(`Found ${affiliates?.length || 0} affiliates with status_id=${statusId} for cohort '${cohortKey}'`); return false;

    if (!affiliates?.length) {
      continue;
    }

    result.totals.affiliates += affiliates.length;

    const affiliateIds = affiliates.map((a) => Number(a.affiliate_id)).filter(Boolean);

    const ruleIdsForThisStatus = rules
      .filter((r) => Number(r.status_id || 0) === Number(statusId))
      .map((r) => Number(r.rule_id))
      .filter(Boolean);

    const rulesForThisStatus = rules.filter((r) => Number(r.status_id || 0) === Number(statusId));

    // 4.2) prefetch last activity + logs
    const lastActivityMap = await getLastActivityMap(affiliateIds);

    const alreadySentSet = await getAlreadySentSet({ affiliateIds, ruleIds: ruleIdsForThisStatus});

    // 4.3) send loop
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
        cohort: cohortKey,
        status_id: statusId,
      };

      for (const rule of rulesForThisStatus) {
        result.totals.checked++;

        const rule_id = Number(rule.rule_id);
        const channel = String(rule.channel); // email | sms
        const template_code = String(rule.template_code || "");

        const delayMin = Number(rule.delay_minutes || 0);
        const dueAtMs = lastActivityMs + delayMin * 60 * 1000;

        // not due yet (production only)
        if (!IS_DEVELOPMENT && now < dueAtMs) {
          result.totals.skippedNotDue++;
          continue;
        }

        // already sent
        const sentKey = `${affiliate_id}:${rule_id}:${channel}`;
        if (alreadySentSet.has(sentKey)) {
          result.totals.skippedAlreadySent++;
          continue;
        }

        // template
        const tpl = templateByKey.get(`${template_code}:${channel}`);
        if (!tpl) {
          result.totals.skippedNoTemplate++;
          continue;
        }

        // contact checks
        if (channel === "email" && !String(aff.email || "").trim()) {
          result.totals.skippedNoContact++;
          continue;
        }
        if (channel === "sms" && !String(aff.telephone || "").trim()) {
          result.totals.skippedNoContact++;
          continue;
        }

        // render
        const subject = applyPlaceholders(tpl.subject || "", vars);
        const body = applyPlaceholders(tpl.body || "", vars);

        let providerResult = null;

        try {
          if (channel === "email") {
            providerResult = await sendEmail({ to: aff.email, subject, html: body });
          } else if (channel === "sms") {
            providerResult = await sendSms({ to: aff.telephone, text: body });
          }
        } catch (e) {
          console.log("Send exception:", e?.message || e);
          providerResult = null;
        }

        // log only if success
        if (providerResult) {
          // await insertSendLog({
          //   affiliate_id,
          //   rule_id,
          //   template_code,
          //   cohort: cohortKey,
          //   channel,
          //   dueAtMs,
          //   provider_message_id: providerResult?.provider_message_id || "",
          // });

          // alreadySentSet.add(sentKey);

          if (channel === "email") result.totals.sentEmail++;
          if (channel === "sms") result.totals.sentSms++;
        } else {
          result.totals.failedSend++;
        }
      }
    }
  }

  result.took_ms = nowMs() - startedAt;
  return result;
}

// ==========================
// CRON handler
// ==========================
export async function GET(req) {
  const startedAt = nowMs();

  // Run one-by-one in the order YOU decide
  const runs = [];
  runs.push(await processCron("lead"));
  runs.push(await processCron("payment_pending"));

  return Response.json({
    ok: true,
    message: "Automation cron completed",
    took_ms: nowMs() - startedAt,
    runs,
  });
}