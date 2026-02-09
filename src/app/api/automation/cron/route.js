import { db } from "@/lib/db";

/**
 * STEP-5: CRON automation sender (Lead cohort only)
 * - Lead = affiliate_status_id = 15
 * - last_activity = latest affiliate_activity.date_added
 * - Send at 1h, 24h, 72h from last_activity
 * - Insert send_log ONLY after send success
 *
 * Secure with CRON_SECRET header.
 */

// ==========================
// CONFIG
// ==========================
// const CRON_SECRET = process.env.CRON_SECRET || "";
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const IS_DEVELOPMENT = ((process.env.IS_DEVELOPMENT === true || process.env.IS_DEVELOPMENT === "true") ? 1 : 0);

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
// SENDERS (Email/SMS stubs)
// Replace with SendGrid/Twilio later
// Must return truthy object on success, else false/null
// ==========================
async function sendEmail({ to, subject, html }) {
  // TODO: integrate SendGrid / SES
  // Return an object on success
  console.log("EMAIL SEND:", { to, subject });
  // Simulate success:
  return { provider: "stub", provider_message_id: `email_${Date.now()}` };
}

async function sendSms({ to, text }) {
  // TODO: integrate Twilio later
  console.log("SMS SEND:", { to, text });
  // Simulate "not enabled" right now:
  return null; // <- keep null so it doesn't insert send_log
}

// ==========================
// Helpers
// ==========================
function nowMs() {
  return Date.now();
}

function msHours(h) {
  return h * 60 * 60 * 1000;
}

/**
 * Get last activity time for an affiliate.
 * Uses affiliate_activity table. If no activity rows exist,
 * fallback to affiliate.date_added.
 */
async function getLastActivityMap(affiliateIds = []) {
  if (!affiliateIds.length) return new Map();

  const idsCsv = affiliateIds.map((id) => Number(id)).filter(Boolean).join(",");
  if (!idsCsv) return new Map();

  // latest activity per affiliate
  const [rows] = await db.query(`SELECT a.affiliate_id, MAX(a.date_added) AS last_activity FROM affiliate_activity a WHERE a.affiliate_id IN (${idsCsv}) GROUP BY a.affiliate_id`);

  const map = new Map();

  for (const r of rows || []) {
    if (r?.affiliate_id) map.set(Number(r.affiliate_id), r.last_activity);
  }

  return map;
}

/**
 * Checks if send_log already exists for (affiliate_id, rule_id, channel)
 */
async function alreadySent({ affiliate_id, rule_id, channel }) {
  const [rows] = await db.query(`
    SELECT send_log_id
    FROM affiliate_automation_send_log
    WHERE affiliate_id='${Number(affiliate_id)}'
      AND rule_id='${Number(rule_id)}'
      AND channel='${String(channel)}'
    LIMIT 1
  `);
  return !!rows?.length;
}

/**
 * Insert send log only after successful send
 */
async function insertSendLog({
  affiliate_id,
  rule_id,
  template_code,
  cohort,
  channel,
  dueAtMs,
  provider_message_id = "",
}) {
  const dueAtSql = `FROM_UNIXTIME(${Math.floor(dueAtMs / 1000)})`;

  await db.query(`
    INSERT INTO affiliate_automation_send_log
      (affiliate_id, rule_id, template_code, cohort, channel,
       due_at, sent_at, provider_message_id, date_added)
    VALUES
      ('${Number(affiliate_id)}',
       '${Number(rule_id)}',
       '${String(template_code)}',
       '${String(cohort)}',
       '${String(channel)}',
       ${dueAtSql},
       NOW(),
       '${String(provider_message_id || "")}',
       NOW())
  `);
}

// ==========================
// CRON handler
// ==========================
export async function GET(req) {
  // // ---- simple auth
  // const secret = req.headers.get("x-cron-secret") || "";
  // if (CRON_SECRET && secret !== CRON_SECRET) {
  //   return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  // }

  // if(process.env.IS_DEVELOPMENT === true || process.env.IS_DEVELOPMENT === "true") {
  //   console.log("CRON run skipped in development mode");
  // } else {
  //   console.log("CRON run started");
  // }

  // console.log(`is Development: ${IS_DEVELOPMENT}`); return false;

  const startedAt = nowMs();

  // 1) Load active rules for Lead cohort only (fixed 3 emails now)
  const [rules] = await db.query(`SELECT * FROM affiliate_automation_rule WHERE status=1 AND cohort='lead' ORDER BY delay_minutes ASC`);

  if (!rules?.length) {
    return Response.json({ ok: true, message: "No rules found", took_ms: nowMs() - startedAt });
  }

  // 2) Find eligible lead affiliates (status_id = 15)
  const [affiliates] = await db.query(`SELECT affiliate_id, firstname, lastname, email, telephone, date_added, affiliate_status_id, stop_automation FROM affiliate WHERE affiliate_status_id=15 AND status=0 AND is_delete=0 AND stop_automation=0 ORDER BY affiliate_id DESC LIMIT 500`);

  if (!affiliates?.length) {
    return Response.json({ ok: true, message: "No lead affiliates", took_ms: nowMs() - startedAt });
  }

  // console.log(affiliates); return false;

  const affIds = affiliates.map((a) => Number(a.affiliate_id)).filter(Boolean);

  // console.log(affIds); return false;

  // 3) Get last_activity per affiliate from affiliate_activity table
  const lastActivityMap = await getLastActivityMap(affIds);

  // console.log(`Last activity map loaded for ${lastActivityMap.size} affiliates`); return false;

  // 4) Load templates used by rules (min queries)
  const templateCodes = Array.from(new Set(rules.map((r) => String(r.template_code || "")).filter(Boolean)));
  let templateByKey = new Map();

  if (templateCodes.length) {
    const codesSql = templateCodes.map((c) => `'${c.replaceAll("'", "''")}'`).join(",");

    const [tpls] = await db.query(`SELECT * FROM affiliate_automation_template WHERE status=1 AND code IN (${codesSql})`);

    for (const t of tpls || []) {
      // key = `${code}:${channel}`
      templateByKey.set(`${t.code}:${t.channel}`, t);
    }
  }

  // 5) Process: for each affiliate, for each rule, check due -> send -> log (only on success)
  let checked = 0;
  let sentEmail = 0;
  let sentSms = 0;
  let skippedAlreadySent = 0;
  let skippedNotDue = 0;
  let skippedNoTemplate = 0;
  let skippedNoContact = 0;
  let failedSend = 0;

  const now = nowMs();

  for (const aff of affiliates) {
    const affiliate_id = Number(aff.affiliate_id);
    
    if (!affiliate_id) {
      continue;
    }

    const lastActivity = lastActivityMap.get(affiliate_id) || aff.date_added; // fallback

    const lastActivityMs = lastActivity ? new Date(lastActivity).getTime() : 0;

    if (!lastActivityMs) {
      continue;
    }

    // variables for templates
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

    for (const rule of rules) {
      checked++;

      const rule_id = Number(rule.rule_id);
      const channel = String(rule.channel);
      const template_code = String(rule.template_code);
      const cohort = String(rule.cohort);

      // compute due
      const delayMin = Number(rule.delay_minutes || 0);
      const dueAtMs = lastActivityMs + delayMin * 60 * 1000;

      // skip if not due yet (only in production, allow send in dev for testing)
      if(!IS_DEVELOPMENT) {
        if (now < dueAtMs) {
          skippedNotDue++;
          continue;
        }
      }

      // skip if already sent
      const sentBefore = await alreadySent({ affiliate_id, rule_id, channel });
      if (sentBefore) {
        skippedAlreadySent++;
        continue;
      }

      // find template
      const tpl = templateByKey.get(`${template_code}:${channel}`);
      if (!tpl) {
        skippedNoTemplate++;
        continue;
      }

      // contact check
      if (channel === "email" && !String(aff.email || "").trim()) {
        skippedNoContact++;
        continue;
      }
      if (channel === "sms" && !String(aff.telephone || "").trim()) {
        skippedNoContact++;
        continue;
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
        console.log("Send exception:", e.message);
        providerResult = null;
      }

      // IMPORTANT: insert log only if send success
      if (providerResult) {
        await insertSendLog({
          affiliate_id,
          rule_id,
          template_code,
          cohort,
          channel,
          dueAtMs,
          provider_message_id: providerResult?.provider_message_id || "",
        });

        if (channel === "email") sentEmail++;
        if (channel === "sms") sentSms++;
      } else {
        failedSend++;
      }
    }
  }

  return Response.json({
    ok: true,
    cohort: "lead",
    totals: {
      affiliates: affiliates.length,
      rules: rules.length,
      checked,
      sentEmail,
      sentSms,
      skippedAlreadySent,
      skippedNotDue,
      skippedNoTemplate,
      skippedNoContact,
      failedSend,
    },
    took_ms: nowMs() - startedAt,
  });
}