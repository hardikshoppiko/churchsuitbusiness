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
"[project]/src/lib/db-utils.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "dbEscape",
    ()=>dbEscape,
    "formatDate",
    ()=>formatDate,
    "generateSalt",
    ()=>generateSalt,
    "getClientIp",
    ()=>getClientIp,
    "getFrontClientIp",
    ()=>getFrontClientIp,
    "isEmail",
    ()=>isEmail,
    "isTenDigitPhone",
    ()=>isTenDigitPhone,
    "isTruthy",
    ()=>isTruthy,
    "money",
    ()=>money,
    "normalizeLogin",
    ()=>normalizeLogin,
    "ocHashPassword",
    ()=>ocHashPassword,
    "ocSerialize",
    ()=>ocSerialize,
    "ocVerifyPassword",
    ()=>ocVerifyPassword,
    "sha1",
    ()=>sha1,
    "stripWebsite",
    ()=>stripWebsite
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$php$2d$serialize$2f$lib$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/php-serialize/lib/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$php$2d$serialize$2f$lib$2f$esm$2f$serialize$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__serialize$3e$__ = __turbopack_context__.i("[project]/node_modules/php-serialize/lib/esm/serialize.js [app-route] (ecmascript) <export default as serialize>");
;
;
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function sha1(str) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("sha1").update(String(str)).digest("hex");
}
function generateSalt() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("md5").update(__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(16).toString("hex") + Date.now()).digest("hex").substring(0, 9);
}
function ocHashPassword(password, salt) {
    return sha1(salt + sha1(salt + sha1(password)));
}
function ocVerifyPassword(inputPassword, storedSalt, storedHash) {
    return ocHashPassword(inputPassword, storedSalt) === storedHash;
}
function dbEscape(value) {
    if (value === null || value === undefined) return "";
    return String(value).replace(/\\/g, "\\\\").replace(/\u0008/g, "\\b").replace(/\t/g, "\\t").replace(/\0/g, "\\0").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\u001a/g, "\\Z").replace(/\x1a/g, "\\Z").replace(/'/g, "\\'").replace(/"/g, '\\"');
}
function stripWebsite(url = "") {
    return String(url).trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}
function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
}
function isTenDigitPhone(v) {
    return /^\d{10}$/.test(String(v || "").trim());
}
function normalizeLogin(v) {
    return String(v || "").trim();
}
function ocSerialize(value) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$php$2d$serialize$2f$lib$2f$esm$2f$serialize$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__serialize$3e$__["serialize"])(value);
}
function isTruthy(v) {
    return v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true";
}
function getClientIp(req) {
    if (!req?.headers) return "127.0.0.1";
    // Proxy / Load balancer / Vercel
    const xForwardedFor = req.headers.get("x-forwarded-for");
    if (xForwardedFor) {
        // Can be: "client, proxy1, proxy2"
        return xForwardedFor.split(",")[0].trim();
    }
    // Cloudflare
    const cfIp = req.headers.get("cf-connecting-ip");
    if (cfIp) return cfIp;
    // Fallback (local dev)
    return "127.0.0.1";
}
function getFrontClientIp() {
    const h = headers();
    // Common proxy headers
    const xff = h.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
    const realIp = h.get("x-real-ip");
    if (realIp) return realIp.trim();
    // Fallback
    return "0.0.0.0";
}
function money(v) {
    const n = Number(v || 0);
    return Number.isFinite(n) ? `$${n.toFixed(2)}` : "$0.00";
}
function parseDate(input) {
    if (!input) return null;
    // Already Date object
    if (input instanceof Date) {
        return isNaN(input.getTime()) ? null : input;
    }
    if (typeof input !== "string") return null;
    // ISO or yyyy-mm-dd hh:mm:ss (MySQL)
    if (/^\d{4}-\d{2}-\d{2}/.test(input)) {
        const d = new Date(input.replace(" ", "T"));
        return isNaN(d.getTime()) ? null : d;
    }
    // dd/mm/yyyy or dd/mm/yyyy hh:mm:ss
    if (/^\d{2}\/\d{2}\/\d{4}/.test(input)) {
        const [datePart, timePart] = input.split(" ");
        const [dd, mm, yyyy] = datePart.split("/");
        const iso = `${yyyy}-${mm}-${dd}${timePart ? "T" + timePart : ""}`;
        const d = new Date(iso);
        return isNaN(d.getTime()) ? null : d;
    }
    // Fallback: let JS try
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
}
function formatDate(input, format = "MM/DD/YYYY") {
    const d = parseDate(input);
    if (!d) return "";
    const map = {
        DD: String(d.getDate()).padStart(2, "0"),
        MM: String(d.getMonth() + 1).padStart(2, "0"),
        YYYY: d.getFullYear(),
        HH: String(d.getHours()).padStart(2, "0"),
        mm: String(d.getMinutes()).padStart(2, "0"),
        ss: String(d.getSeconds()).padStart(2, "0")
    };
    return format.replace(/DD|MM|YYYY|HH|mm|ss/g, (k)=>map[k]);
}
}),
"[project]/src/app/api/affiliate/register/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db-utils.js [app-route] (ecmascript)");
;
;
/**
 * INSERT INTO affiliate_extension (OpenCart style)
 */ async function installModule(type, code, affiliate_id) {
    const sql = `
    INSERT INTO affiliate_extension SET
      affiliate_id='${Number(affiliate_id)}',
      \`type\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(type)}',
      \`code\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(code)}'
  `;
    const [res] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(sql);
    return res.insertId;
}
/**
 * INSERT affiliate settings (OpenCart style)
 * - Deletes existing entries for affiliate+code
 * - Inserts each key/value pair
 */ async function addAffiliateSettings(code, data, affiliate_id = 0) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
    DELETE FROM affiliate_setting
    WHERE affiliate_id='${Number(affiliate_id)}'
      AND \`code\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(code)}'
  `);
    for (const [key, value] of Object.entries(data || {})){
        if (!String(key).startsWith(code)) continue;
        if (value === null || value === undefined || typeof value !== "object") {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
        INSERT INTO affiliate_setting SET
          affiliate_id='${Number(affiliate_id)}',
          \`code\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(code)}',
          \`key\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(key)}',
          \`value\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(value)}',
          serialized='0'
      `);
        } else {
            const serialized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ocSerialize"])(value);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
        INSERT INTO affiliate_setting SET
          affiliate_id='${Number(affiliate_id)}',
          \`code\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(code)}',
          \`key\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(key)}',
          \`value\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(serialized)}',
          serialized='1'
      `);
        }
    }
}
async function getAffiliateBasicSettings() {
    const sql = `SELECT \`key\`, \`value\` FROM affiliate_basic_setting WHERE \`code\`='affiliate_basic'`;
    const [rows] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(sql);
    if (!rows || rows.length === 0) return {};
    const settings = {};
    for (const row of rows)settings[row.key] = row.value;
    return settings;
}
async function addAffiliateCategory(affiliate_id) {
    const categories = [];
    for(let i = 0; i < 2; i++){
        const name = `Category ${i + 1}`;
        const sql = `
      INSERT INTO category SET
      category_old_id=0,
      category_child_old_id=0,
      affiliate_id='${Number(affiliate_id)}',
      name='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(name)}',
      name_affiliate='',
      description='Category',
      meta_title='Category',
      meta_description='Category',
      meta_keyword='Category',
      shopify_tag='',
      export_product_to_shopify=0,
      is_shopify_product_update_forcefully=0,
      dcs_brief='',
      dcs_detail='',
      dcs_short='',
      is_description_mobile=0,
      is_not_for_wholesale=0,
      is_not_for_affiliate=0,
      image='',
      image_path='',
      image_affiliate='',
      folder_name='',
      parent_id=0,
      top=1,
      is_catalog=0,
      is_special=0,
      is_women=0,
      is_men=0,
      is_accessories=0,
      \`column\`=0,
      sort_order='${i + 1}',
      status=1,
      date_added=NOW(),
      date_modified=NOW()
    `;
        const [res] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(sql);
        const category_id = res.insertId;
        categories.push(category_id);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
      INSERT INTO category_path SET
        category_id='${Number(category_id)}',
        path_id='${Number(category_id)}',
        level='0'
    `);
    }
    return categories;
}
async function addAffiliateProducts(affiliate_id, categories = []) {
    const products = [];
    for(let i = 0; i < 4; i++){
        const name = `Product ${i + 1}`;
        const sql = `
      INSERT INTO product SET
        product_old_id=0,
        affiliate_id='${Number(affiliate_id)}',
        name='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(name)}',
        description='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(name)}',
        meta_title='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(name)}',
        meta_description='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(name)}',
        meta_keyword='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(name)}',
        model='',
        sku='',
        upc='',
        ean='',
        jan='',
        isbn='',
        mpn='',
        location='',
        quantity='1000',
        stock_status_id=0,
        image='affiliate_images/demo-product.jpg',
        image_path='',
        file_name='',
        is_large_image_found=0,
        is_image_background_is_white=0,
        video='',
        manufacturer_id=0,
        brand_id=0,
        shipping=1,
        price='100',
        price_retail='125',
        price_original='150',
        is_men=0,
        points=0,
        tax_class_id=0,
        date_available=NOW(),
        weight='0.000',
        weight_class_id=0,
        length='0.000',
        width='0.000',
        height='0.000',
        length_class_id=0,
        subtract=0,
        minimum='1',
        sort_order='${i + 1}',
        status='1',
        viewed=0,
        is_product_modified=0,
        is_web_scrape_product_verify=0,
        date_added=NOW(),
        date_modified=NOW()
    `;
        const [res] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(sql);
        const product_id = res.insertId;
        products.push(product_id);
        if (categories && categories.length) {
            for (const category_id of categories){
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
          INSERT INTO product_to_category SET
            product_id='${Number(product_id)}',
            category_id='${Number(category_id)}'
        `);
            }
        }
    }
    return products;
}
async function addAffiliatePages(affiliate_id, pages = []) {
    for (const page of pages){
        const sql = `
      INSERT INTO information SET
        affiliate_id='${Number(affiliate_id)}',
        title='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(page.name)}',
        description='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(page.description)}',
        description_top='',
        short='',
        meta_title='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(page.meta_title)}',
        meta_description='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(page.meta_description)}',
        meta_keyword='',
        image='',
        image_mobile='',
        top='0',
        bottom='1',
        affiliate=0,
        catalog='',
        trending_product_title='',
        trending_product_status=0,
        trending_categories='',
        sort_order='${Number(page.sort_order || 0)}',
        status='${Number(page.status || 0)}'
    `;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(sql);
    }
}
async function addLargeBanners(affiliate_id) {
    const sliders = {
        code: "slideshow",
        module_name: "Home Page Slideshow",
        width: "1900",
        height: "700",
        sort_order: "1",
        status: "1",
        slideshow_images: [
            {
                title: "First",
                link: "index.php?route=product/catalog",
                image: "catalog/banner/1.jpg",
                sort_order: 1
            },
            {
                title: "Second",
                link: "index.php?route=product/catalog",
                image: "catalog/banner/2.jpg",
                sort_order: 2
            }
        ]
    };
    const settings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ocSerialize"])(sliders);
    const sql = `
    INSERT INTO page_builder SET
      affiliate_id='${Number(affiliate_id)}',
      page_id=0,
      module_name='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(sliders.module_name)}',
      \`code\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(sliders.code)}',
      \`setting\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(settings)}',
      location_type=0,
      sort_order='${Number(sliders.sort_order)}',
      status='${Number(sliders.status)}',
      date_added=NOW(),
      date_modified=NOW(),
      user_added=0,
      user_modified=0,
      is_delete=0
  `;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(sql);
}
async function addSmallBanners(affiliate_id) {
    const banners = {
        code: "banner",
        module_name: "Home Page Banners",
        width: "380",
        height: "270",
        sort_order: "2",
        status: "1",
        banner_images: [
            {
                title: "Womens",
                link: "index.php?route=product/womens",
                image: "catalog/banner-small/1.jpg",
                sort_order: 1
            },
            {
                title: "Mens",
                link: "index.php?route=product/mens",
                image: "catalog/banner-small/2.jpg",
                sort_order: 2
            },
            {
                title: "Accessories",
                link: "index.php?route=product/accessories",
                image: "catalog/banner-small/3.jpg",
                sort_order: 3
            }
        ]
    };
    const settings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ocSerialize"])(banners);
    const sql = `
    INSERT INTO page_builder SET
      affiliate_id='${Number(affiliate_id)}',
      page_id=0,
      module_name='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(banners.module_name)}',
      \`code\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(banners.code)}',
      \`setting\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(settings)}',
      location_type=0,
      sort_order='${Number(banners.sort_order)}',
      status='${Number(banners.status)}',
      date_added=NOW(),
      date_modified=NOW(),
      user_added=0,
      user_modified=0,
      is_delete=0
  `;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(sql);
}
async function getChildCategories(parent_id) {
    const sql = `
    SELECT category_id
    FROM category
    WHERE parent_id='${Number(parent_id)}' AND status=1
    ORDER BY sort_order ASC, category_id ASC
  `;
    const [rows] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(sql);
    return (rows || []).map((r)=>Number(r.category_id));
}
function pickRandom(arr = []) {
    if (!arr.length) return null;
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
}
async function addCategoryProductsModule(affiliate_id) {
    const women_categories = await getChildCategories(1);
    const accessaries_category = await getChildCategories(434);
    const men_categories = await getChildCategories(493);
    const selectedWomen = pickRandom(women_categories);
    const selectedAccessories = pickRandom(accessaries_category);
    const selectedMen = pickRandom(men_categories);
    const category_product_module = {
        code: "category_product_module",
        module_name: "Latest Category Products",
        category: "",
        categories: [],
        limit: 4,
        width: 200,
        height: 200,
        sort_order: 3,
        status: 1
    };
    if (selectedWomen) category_product_module.categories.push(selectedWomen);
    if (selectedAccessories) category_product_module.categories.push(selectedAccessories);
    if (selectedMen) category_product_module.categories.push(selectedMen);
    const setting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ocSerialize"])(category_product_module);
    const sql = `
    INSERT INTO page_builder SET
      affiliate_id='${Number(affiliate_id)}',
      page_id=0,
      module_name='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(category_product_module.module_name)}',
      \`code\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(category_product_module.code)}',
      \`setting\`='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(setting)}',
      location_type=0,
      sort_order='${Number(category_product_module.sort_order)}',
      status='${Number(category_product_module.status)}',
      date_added=NOW(),
      date_modified=NOW(),
      user_added=0,
      user_modified=0,
      is_delete=0
  `;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(sql);
}
/** helper: check affiliate exists */ async function getAffiliateById(affiliate_id) {
    const affId = Number(affiliate_id);
    if (!affId) return null;
    const [rows] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`SELECT * FROM affiliate WHERE affiliate_id=${affId} LIMIT 1`);
    return rows?.[0] || null;
}
/** helper: safe placeholder store name */ function makeTempStoreName() {
    return `TEMP-${Date.now()}`;
}
async function godaddyCheckDomain(domainRaw) {
    const json = {};
    const domain_name = String(domainRaw || "").trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
    // Validate like PHP (domain url must be valid)
    const domainOk = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain_name);
    if (!domainOk) {
        json.error = "Warning: Please enter valid URL!";
        return json;
    }
    const API_KEY = process.env.GODADDY_API_KEY;
    const API_SECRET = process.env.GODADDY_API_SECRET;
    const BASE_URL = process.env.GODADDY_BASE_URL || "https://api.godaddy.com";
    if (!API_KEY || !API_SECRET) {
        json.error = "GoDaddy API credentials missing";
        return json;
    }
    const header = {
        Authorization: `sso-key ${API_KEY}:${API_SECRET}`,
        "Content-Type": "application/json"
    };
    // 1) availability
    const url = `${BASE_URL}/v1/domains/available?domain=${encodeURIComponent(domain_name)}&checkType=FAST&forTransfer=false`;
    const res = await fetch(url, {
        method: "GET",
        headers: header,
        cache: "no-store"
    });
    const final_result = await res.json().catch(()=>({}));
    // Similar to your PHP check
    if (final_result?.code === "ACCESS_DENIED") {
        json.error = "GoDaddy ACCESS_DENIED";
        return json;
    }
    if (final_result?.available === true) {
        json.success = true;
        json.domain_found = "Congratulation, domain available!";
        return json;
    }
    // Not available → suggestions
    json.error = "Warning: Domain not available!";
    json.domain_not_available = true;
    // suggestion query: first token before dot (like PHP)
    const base = domain_name.replace(/^www\./i, "");
    const parts = base.split(".");
    const keyword = parts[0] || base;
    const suggestUrl = `${BASE_URL}/v1/domains/suggest?query=${encodeURIComponent(keyword)}` + `&sources=keywordspin&waitMs=1000`;
    const sres = await fetch(suggestUrl, {
        method: "GET",
        headers: header,
        cache: "no-store"
    });
    const suggestions = await sres.json().catch(()=>[]);
    if (Array.isArray(suggestions) && suggestions.length > 0) {
        const list = [];
        for (const item of suggestions){
            const d = item?.domain;
            if (typeof d === "string" && d.toLowerCase().endsWith(".com")) {
                list.push(d);
            }
        }
        if (list.length) json.domain_suggestions = list;
    }
    return json;
}
async function POST(req) {
    const body = await req.json().catch(()=>({}));
    // domain availability action (NO new route)
    if (String(body?.action || "") === "check_domain") {
        const domain_name = body?.domain_name || "";
        const result = await godaddyCheckDomain(domain_name);
        return Response.json(result);
    }
    const step = Number(body.step || 0);
    if (![
        1,
        2,
        3
    ].includes(step)) {
        return Response.json({
            message: "step is required (1,2,3)"
        }, {
            status: 400
        });
    }
    // shared
    const ip = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClientIp"])(req);
    // ------------------------------------------------------------
    // STEP 1: create OR update affiliate with personal info only
    // ------------------------------------------------------------
    if (step === 1) {
        const firstname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.firstname);
        const lastname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.lastname);
        const email = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.email).toLowerCase();
        const telephone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.telephone);
        const incomingAffiliateId = Number(body?.affiliate_id || 0) || 0;
        // validations (only personal)
        if (!firstname) return Response.json({
            message: "firstname is required"
        }, {
            status: 400
        });
        if (firstname.length < 1 || firstname.length > 32) {
            return Response.json({
                message: "First name must be between 1 to 32 characters"
            }, {
                status: 400
            });
        }
        if (!lastname) return Response.json({
            message: "lastname is required"
        }, {
            status: 400
        });
        if (lastname.length < 1 || lastname.length > 32) {
            return Response.json({
                message: "Last name must be between 1 to 32 characters"
            }, {
                status: 400
            });
        }
        if (!email) return Response.json({
            message: "email is required"
        }, {
            status: 400
        });
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isEmail"])(email)) {
            return Response.json({
                message: "Please enter a valid email address"
            }, {
                status: 400
            });
        }
        if (!telephone) return Response.json({
            message: "telephone is required"
        }, {
            status: 400
        });
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTenDigitPhone"])(telephone)) {
            return Response.json({
                message: "Phone/Mobile must be exactly 10 digits (numbers only)"
            }, {
                status: 400
            });
        }
        // ✅ uniqueness checks (ignore self if updating)
        const notSelf = incomingAffiliateId ? `AND affiliate_id <> ${incomingAffiliateId}` : "";
        const [emailRows] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
      SELECT affiliate_id
      FROM affiliate
      WHERE LOWER(email)=LOWER('${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(email)}')
      ${notSelf}
      LIMIT 1
    `);
        if (emailRows?.length) {
            return Response.json({
                message: "Email already exists"
            }, {
                status: 409
            });
        }
        const [telRows] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
      SELECT affiliate_id
      FROM affiliate
      WHERE telephone='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(telephone)}'
      ${notSelf}
      LIMIT 1
    `);
        if (telRows?.length) {
            return Response.json({
                message: "Phone/Mobile already exists"
            }, {
                status: 409
            });
        }
        // ✅ If affiliate_id provided and exists -> UPDATE (do NOT insert again)
        if (incomingAffiliateId) {
            const existing = await getAffiliateById(incomingAffiliateId);
            if (existing) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
          UPDATE affiliate SET
            firstname='${firstname}',
            lastname='${lastname}',
            email='${email}',
            telephone='${telephone}',
            ip='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(ip)}',
            date_modified=NOW()
          WHERE affiliate_id=${incomingAffiliateId}
          LIMIT 1
        `);
                return Response.json({
                    success: true,
                    step: 1,
                    affiliate_id: incomingAffiliateId,
                    mode: "updated"
                });
            }
        }
        // ✅ Otherwise create minimal row (insert)
        const tempStore = makeTempStoreName();
        // set a temporary password hash (will be overwritten in step3)
        const salt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateSalt"])();
        const tmpPwd = `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const hashPassword = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ocHashPassword"])(tmpPwd, salt);
        const affiliateSql = `
      INSERT INTO affiliate SET
        affiliate_type='0',
        fees='0',
        store_name='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(tempStore)}',
        firstname='${firstname}',
        lastname='${lastname}',
        email='${email}',
        from_email='',
        telephone='${telephone}',
        fax='',
        password='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(hashPassword)}',
        salt='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(salt)}',
        company='',
        website='',
        address_1='',
        address_2='',
        city='',
        postcode='',
        country_id='0',
        zone_id='0',
        code='',
        is_customer_own_domain='0',
        is_domain_available='0',
        stripe_token='',
        stripe_customer_id='',
        stripe_plan_id='',
        recurring_billing='0',
        recurring_billing_id='0',
        start_date=NOW(),
        end_date=NOW(),
        store_category_type='0',
        commission='0',
        tax='',
        payment='',
        cheque='',
        paypal='',
        bank_name='',
        bank_branch_number='',
        bank_swift_code='',
        bank_account_name='',
        bank_account_number='',
        ip='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(ip)}',
        status='0',
        newsletter='1',
        newsletter_text='0',
        affiliate_status_id='15',
        approved='0',
        stop_automation='0',
        user_added='0',
        user_modified='0',
        date_added=NOW(),
        date_modified=NOW(),
        date_update=NOW(),
        is_delete='0'
    `;
        const [result] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(affiliateSql);
        const affiliate_id = result.insertId;
        return Response.json({
            success: true,
            step: 1,
            affiliate_id,
            mode: "inserted"
        });
    }
    // ------------------------------------------------------------
    // STEP 2: update plan + business info
    // ------------------------------------------------------------
    if (step === 2) {
        const affiliate_id = Number(body.affiliate_id || 0);
        if (!affiliate_id) return Response.json({
            message: "affiliate_id is required"
        }, {
            status: 400
        });
        const affiliate = await getAffiliateById(affiliate_id);
        if (!affiliate) return Response.json({
            message: "Affiliate not found"
        }, {
            status: 404
        });
        const affiliate_plan_id = Number(body.affiliate_plan_id || 0);
        const fees = Number(body.fees || 0);
        const business_name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.business_name);
        const website_domain = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripWebsite"])(body.website || "");
        const website = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(website_domain);
        const stripe_plan_id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.stripe_plan_id || "");
        const price_schema = Number(body.price_schema || 0);
        const default_markup = Number(body.default_markup || 0);
        const retail_price_commission = Number(body.retail_price_commission || 0);
        const is_catalog_access = body.is_catalog_access;
        // validations step2
        if (!affiliate_plan_id) {
            return Response.json({
                message: "affiliate_plan_id is required"
            }, {
                status: 400
            });
        }
        if (!business_name) {
            return Response.json({
                message: "business_name is required"
            }, {
                status: 400
            });
        }
        if (business_name.length < 3 || business_name.length > 32) {
            return Response.json({
                message: "Business name must be between 3 to 32 characters"
            }, {
                status: 400
            });
        }
        // website optional but validate if present
        if (website_domain) {
            const domainOk = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(website_domain);
            if (!domainOk) {
                return Response.json({
                    message: "Website must be a valid domain like example.com"
                }, {
                    status: 400
                });
            }
        }
        // uniqueness checks for business_name + website (email/tel already done in step1)
        const [bizRows] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`SELECT affiliate_id FROM affiliate WHERE LOWER(store_name)=LOWER('${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(business_name)}') AND affiliate_id<>${affiliate_id} LIMIT 1`);
        if (bizRows?.length) return Response.json({
            message: "Business name already exists"
        }, {
            status: 409
        });
        if (website_domain) {
            const [webRows] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`SELECT affiliate_id FROM affiliate WHERE LOWER(website)=LOWER('${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(website_domain)}') AND affiliate_id<>${affiliate_id} LIMIT 1`);
            if (webRows?.length) return Response.json({
                message: "Website already exists"
            }, {
                status: 409
            });
        }
        // update
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
      UPDATE affiliate SET
        affiliate_type='${affiliate_plan_id}',
        fees='${fees}',
        store_name='${business_name}',
        website='${website}',
        stripe_plan_id='${stripe_plan_id}',
        date_modified=NOW(),
        ip='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(ip)}'
      WHERE affiliate_id=${affiliate_id}
    `);
        // NOTE:
        // price_schema/default_markup/retail_price_commission/is_catalog_access are used later in step3 settings/demo creation.
        // We keep them in memory from request (client sends again in step3 OR you can store them in affiliate table if you have columns).
        // For now: client should resend them in step3 as well OR you can store them somewhere.
        // We will REQUIRE step3 request to include these values again (same as your previous single-step flow).
        return Response.json({
            success: true,
            step: 2,
            affiliate_id
        });
    }
    // ------------------------------------------------------------
    // STEP 3: update address + password + terms, then run FULL setup
    // ------------------------------------------------------------
    if (step === 3) {
        const affiliate_id = Number(body.affiliate_id || 0);
        if (!affiliate_id) return Response.json({
            message: "affiliate_id is required"
        }, {
            status: 400
        });
        const affiliate = await getAffiliateById(affiliate_id);
        if (!affiliate) return Response.json({
            message: "Affiliate not found"
        }, {
            status: 404
        });
        const address_1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.address_1);
        const address_2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.address_2 || "");
        const city = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.city);
        const postcode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.postcode);
        const country_id = Number(body.country_id || 0);
        const zone_id = Number(body.zone_id || 0);
        const password = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.password ?? "");
        const confirm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(body.confirm ?? "");
        const agree = body.agree_terms === true || body.agree_terms === "true" || body.agree_terms === "1" || body.agree_terms === 1;
        // validations step3
        if (!address_1) return Response.json({
            message: "address_1 is required"
        }, {
            status: 400
        });
        if (!city) return Response.json({
            message: "city is required"
        }, {
            status: 400
        });
        if (!country_id) return Response.json({
            message: "country_id is required"
        }, {
            status: 400
        });
        if (!zone_id) return Response.json({
            message: "zone_id is required"
        }, {
            status: 400
        });
        if (!password) return Response.json({
            message: "password is required"
        }, {
            status: 400
        });
        if (password.length < 6 || password.length > 20) {
            return Response.json({
                message: "Password must be between 6 to 20 characters"
            }, {
                status: 400
            });
        }
        if (password !== confirm) {
            return Response.json({
                message: "Passwords do not match"
            }, {
                status: 400
            });
        }
        if (!agree) {
            return Response.json({
                message: "You must agree to the Terms & Conditions"
            }, {
                status: 400
            });
        }
        // these must be present for your original setup logic
        const price_schema = Number(body.price_schema || 0);
        const default_markup = Number(body.default_markup || 0);
        const retail_price_commission = Number(body.retail_price_commission || 0);
        const is_catalog_access = body.is_catalog_access;
        // set real password now
        const salt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateSalt"])();
        const hashPassword = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ocHashPassword"])(password, salt);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(`
      UPDATE affiliate SET
        affiliate_status_id='1',
        address_1='${address_1}',
        address_2='${address_2}',
        city='${city}',
        postcode='${postcode}',
        country_id='${country_id}',
        zone_id='${zone_id}',
        password='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(hashPassword)}',
        salt='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(salt)}',
        date_modified=NOW(),
        ip='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(ip)}'
      WHERE affiliate_id=${affiliate_id}
    `);
        // Reload latest affiliate after step3 update
        const aff = await getAffiliateById(affiliate_id);
        // --------------------------------------------
        // NOW RUN YOUR ORIGINAL "heavy" setup
        // --------------------------------------------
        const firstname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(aff.firstname || "");
        const lastname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(aff.lastname || "");
        const email = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(String(aff.email || "")).toLowerCase();
        const telephone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(aff.telephone || "");
        const business_name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(aff.store_name || "");
        const website = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(aff.website || "");
        // 1) Create affiliate_user
        const username = email;
        const affiliateUserQuery = `INSERT INTO affiliate_user SET
      affiliate_id='${affiliate_id}',
      username='${username}',
      password='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(hashPassword)}',
      salt='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(salt)}',
      firstname='${firstname}',
      lastname='${lastname}',
      email='${email}',
      telephone='${telephone}',
      image='',
      code='',
      ip='${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbEscape"])(ip)}',
      status='0',
      user_added='0',
      date_added=NOW(),
      date_modified=NOW(),
      is_delete=0
    `;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(affiliateUserQuery);
        // 2) Install totals/modules
        await installModule("total", "sub_total", affiliate_id);
        await addAffiliateSettings("affiliate_sub_total", {
            affiliate_sub_total_status: "1",
            affiliate_sub_total_sort_order: "1"
        }, affiliate_id);
        await installModule("total", "shipping", affiliate_id);
        await addAffiliateSettings("affiliate_shipping", {
            affiliate_shipping_status: "2",
            affiliate_shipping_sort_order: "10"
        }, affiliate_id);
        await installModule("total", "coupon", affiliate_id);
        await addAffiliateSettings("affiliate_coupon", {
            affiliate_coupon_status: "1",
            affiliate_coupon_sort_order: "3"
        }, affiliate_id);
        await installModule("total", "credit", affiliate_id);
        await addAffiliateSettings("affiliate_credit", {
            affiliate_credit_status: "1",
            affiliate_credit_sort_order: "4"
        }, affiliate_id);
        await installModule("total", "reward", affiliate_id);
        await addAffiliateSettings("affiliate_reward", {
            affiliate_reward_status: "1",
            affiliate_reward_sort_order: "5"
        }, affiliate_id);
        await installModule("total", "total", affiliate_id);
        await addAffiliateSettings("affiliate_total", {
            affiliate_total_status: "1",
            affiliate_total_sort_order: "100"
        }, affiliate_id);
        // 3) Affiliate config settings
        const affiliate_basic_settings = await getAffiliateBasicSettings();
        const affiliate_setting = {};
        if (price_schema === 1 || price_schema === 3) {
            affiliate_setting["affiliate_config_markup"] = default_markup ? default_markup : 30;
        } else {
            affiliate_setting["affiliate_config_markup"] = 0;
        }
        affiliate_setting["affiliate_config_name"] = business_name;
        affiliate_setting["affiliate_config_url"] = website;
        affiliate_setting["affiliate_config_owner"] = `${firstname} ${lastname}`.trim();
        let fullAddress = address_1;
        if (address_2 && address_2.trim() !== "") fullAddress += `, ${address_2}`;
        fullAddress += `, ${city}`;
        fullAddress += ` - ${postcode}`;
        affiliate_setting["affiliate_config_address"] = fullAddress;
        affiliate_setting["affiliate_config_email"] = email;
        affiliate_setting["affiliate_config_telephone"] = telephone;
        affiliate_setting["affiliate_config_visible_telephone"] = 1;
        affiliate_setting["affiliate_config_meta_title"] = business_name;
        affiliate_setting["affiliate_config_country_id"] = country_id;
        affiliate_setting["affiliate_config_zone_id"] = zone_id;
        // ✅ keep your defaults (same as before)
        affiliate_setting["affiliate_config_currency"] = "USD";
        affiliate_setting["affiliate_config_order_status_id"] = 2;
        affiliate_setting["affiliate_config_processing_status"] = [
            2
        ];
        affiliate_setting["affiliate_config_complete_status"] = [
            5,
            15
        ];
        affiliate_setting["affiliate_config_image_category_width"] = 1200;
        affiliate_setting["affiliate_config_image_category_height"] = 300;
        affiliate_setting["affiliate_config_image_product_width"] = 370;
        affiliate_setting["affiliate_config_image_product_height"] = 370;
        affiliate_setting["affiliate_config_image_popup_width"] = 1000;
        affiliate_setting["affiliate_config_image_popup_height"] = 1000;
        affiliate_setting["affiliate_config_image_thumb_width"] = 370;
        affiliate_setting["affiliate_config_image_thumb_height"] = 370;
        affiliate_setting["affiliate_config_image_additional_width"] = 475;
        affiliate_setting["affiliate_config_image_additional_height"] = 475;
        affiliate_setting["affiliate_config_image_catalog_width"] = 600;
        affiliate_setting["affiliate_config_image_catalog_height"] = 482;
        affiliate_setting["affiliate_config_template"] = "default";
        affiliate_setting["affiliate_config_checkout_guest"] = 1;
        affiliate_setting["affiliate_config_apply_store_coupons"] = 1;
        affiliate_setting["affiliate_config_subscribe_status"] = 1;
        affiliate_setting["affiliate_config_subscribe_heading"] = "Subscribe to our Newsletter";
        affiliate_setting["affiliate_config_subscribe_top_text"] = `<p style="margin-top:15px; line-height: 22px;">Enter your email address to get the hottest deals Online. </p>
<p style="margin-top:15px; line-height: 22px;"><span style="font-weight: bold;">You will be the first </span>to know about our offers, new arrivals, and more!<br></p>`;
        affiliate_setting["affiliate_config_subscribe_bottom_text"] = `<p style="line-height: 22px;">We value our customers and will not share your email address to any third party. You will not be spammed.<br></p>`;
        affiliate_setting["affiliate_config_subscribe_button_text"] = "";
        affiliate_setting["affiliate_config_subscribe_image_position"] = "left";
        affiliate_setting["affiliate_config_subscribe_success"] = "Success: Your email address subscribed successfully!";
        const footer_description = "We are carrying the biggest collection for church fashions which includes all the designer church suits, church dresses and church hats.";
        affiliate_setting["affiliate_config_footer_description"] = affiliate_basic_settings?.["affiliate_basic_footer_description"] ? String(affiliate_basic_settings["affiliate_basic_footer_description"]) : footer_description;
        affiliate_setting["affiliate_config_catalog_column"] = 3;
        affiliate_setting["affiliate_config_pp_standard_email"] = email;
        affiliate_setting["affiliate_config_pp_standard_status"] = 1;
        affiliate_setting["affiliate_config_pp_standard_test"] = 0;
        affiliate_setting["affiliate_config_pp_standard_debug"] = 0;
        affiliate_setting["affiliate_config_pp_standard_transaction"] = 1;
        const header_tag_line = "Leading Church Fashion Brand";
        affiliate_setting["affiliate_config_tagline"] = affiliate_basic_settings?.["affiliate_basic_tagline"] ? affiliate_basic_settings["affiliate_basic_tagline"] : header_tag_line;
        affiliate_setting["affiliate_config_display_address"] = 0;
        await addAffiliateSettings("affiliate_config", affiliate_setting, affiliate_id);
        // 4) demo categories/products only if advanced
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTruthy"])(is_catalog_access)) {
            const categories = await addAffiliateCategory(affiliate_id);
            await addAffiliateProducts(affiliate_id, categories);
        }
        // 5) default pages
        await addAffiliatePages(affiliate_id, [
            {
                name: "About Us",
                description: "About Us",
                meta_title: "About Us",
                meta_description: "About Us",
                sort_order: "1",
                status: "1"
            }
        ]);
        // 6) banners + modules
        await addLargeBanners(affiliate_id);
        await addSmallBanners(affiliate_id);
        await addCategoryProductsModule(affiliate_id);
        return Response.json({
            success: true,
            step: 3,
            affiliate_id
        });
    }
    // fallback (should never happen)
    return Response.json({
        message: "Invalid step"
    }, {
        status: 400
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__19b43cd1._.js.map