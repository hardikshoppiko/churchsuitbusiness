module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/timers [external] (timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("timers", () => require("timers"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[project]/src/lib/db.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mysql2/promise.js [app-route] (ecmascript)");
;
const db = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10
});
}),
"[project]/src/app/api/automation/cron/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.js [app-route] (ecmascript)");
;
/**
 * STEP-5: CRON automation sender (Lead cohort only)
 * - Lead = affiliate_status_id = 15
 * - last_activity = latest affiliate_activity.date_added
 * - Send at 1h, 24h, 72h from last_activity
 * - Insert send_log ONLY after send success
 *
 * Secure with CRON_SECRET header.
 */ // ==========================
// CONFIG
// ==========================
// const CRON_SECRET = process.env.CRON_SECRET || "";
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const IS_DEVELOPMENT = process.env.IS_DEVELOPMENT === true || process.env.IS_DEVELOPMENT === "true" ? 1 : 0;
// ==========================
// Placeholder replace
// ==========================
function applyPlaceholders(str = "", vars = {}) {
    let out = String(str || "");
    for (const [k, v] of Object.entries(vars)){
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
    console.log("EMAIL SEND:", {
        to,
        subject
    });
    // Simulate success:
    return {
        provider: "stub",
        provider_message_id: `email_${Date.now()}`
    };
}
async function sendSms({ to, text }) {
    // TODO: integrate Twilio later
    console.log("SMS SEND:", {
        to,
        text
    });
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
 */ async function getLastActivityMap(affiliateIds = []) {
    if (!affiliateIds.length) return new Map();
    const idsCsv = affiliateIds.map((id)=>Number(id)).filter(Boolean).join(",");
    if (!idsCsv) return new Map();
    // latest activity per affiliate
    const [rows] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`SELECT a.affiliate_id, MAX(a.date_added) AS last_activity FROM affiliate_activity a WHERE a.affiliate_id IN (${idsCsv}) GROUP BY a.affiliate_id`);
    const map = new Map();
    for (const r of rows || []){
        if (r?.affiliate_id) map.set(Number(r.affiliate_id), r.last_activity);
    }
    return map;
}
/**
 * Checks if send_log already exists for (affiliate_id, rule_id, channel)
 */ async function alreadySent({ affiliate_id, rule_id, channel }) {
    const [rows] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
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
 */ async function insertSendLog({ affiliate_id, rule_id, template_code, cohort, channel, dueAtMs, provider_message_id = "" }) {
    const dueAtSql = `FROM_UNIXTIME(${Math.floor(dueAtMs / 1000)})`;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
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
async function GET(req) {
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
    console.log(`is Development: ${IS_DEVELOPMENT}`);
    return false;
    //TURBOPACK unreachable
    ;
    const startedAt = undefined;
    // 1) Load active rules for Lead cohort only (fixed 3 emails now)
    const rules = undefined;
    // 2) Find eligible lead affiliates (status_id = 15)
    const affiliates = undefined;
    // console.log(affiliates); return false;
    const affIds = undefined;
    // console.log(affIds); return false;
    // 3) Get last_activity per affiliate from affiliate_activity table
    const lastActivityMap = undefined;
    // console.log(`Last activity map loaded for ${lastActivityMap.size} affiliates`); return false;
    // 4) Load templates used by rules (min queries)
    const templateCodes = undefined;
    let templateByKey;
    // 5) Process: for each affiliate, for each rule, check due -> send -> log (only on success)
    let checked;
    let sentEmail;
    let sentSms;
    let skippedAlreadySent;
    let skippedNotDue;
    let skippedNoTemplate;
    let skippedNoContact;
    let failedSend;
    const now = undefined;
    const aff = undefined;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__86d5e45e._.js.map