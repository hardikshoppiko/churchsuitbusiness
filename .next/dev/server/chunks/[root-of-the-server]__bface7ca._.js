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
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/auth.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSession",
    ()=>clearSession,
    "createSession",
    ()=>createSession,
    "getSession",
    ()=>getSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
const COOKIE_NAME = "wsf_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days
function getSecret() {
    const s = process.env.AUTH_SECRET;
    if (!s) throw new Error("AUTH_SECRET is missing in .env.local");
    return new TextEncoder().encode(s);
}
async function createSession(payload) {
    const token = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: "HS256"
    }).setIssuedAt().setExpirationTime(`${MAX_AGE_SEC}s`).sign(getSecret());
    // ✅ cookies() is async in Route Handlers
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE_SEC
    });
    return token;
}
async function clearSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0
    });
}
async function getSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, getSecret());
        return payload;
    } catch  {
        return null;
    }
}
}),
"[project]/src/lib/db-utils.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
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
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$php$2d$serialize$2f$lib$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/php-serialize/lib/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$php$2d$serialize$2f$lib$2f$esm$2f$serialize$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__serialize$3e$__ = __turbopack_context__.i("[project]/node_modules/php-serialize/lib/esm/serialize.js [app-route] (ecmascript) <export default as serialize>");
;
;
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
"[project]/src/app/api/account/login/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
// src/app/api/account/login/route.js
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db-utils.js [app-route] (ecmascript)");
;
;
;
async function POST(req) {
    try {
        const body = await req.json().catch(()=>({}));
        console.log(body);
        const username = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLogin"])(body.username); // email OR phone
        const password = String(body.password || "");
        if (!username) {
            return Response.json({
                success: false,
                message: "Email or phone is required"
            }, {
                status: 400
            });
        }
        if (!password) {
            return Response.json({
                success: false,
                message: "Password is required"
            }, {
                status: 400
            });
        }
        const isPhone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTenDigitPhone"])(username);
        const [rows] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(isPhone ? "SELECT * FROM affiliate_user WHERE REPLACE(telephone,' ','')=? LIMIT 1" : "SELECT * FROM affiliate_user WHERE LOWER(email)=LOWER(?) LIMIT 1", [
            username
        ]);
        const user = rows?.[0];
        if (!user) {
            return Response.json({
                success: false,
                message: "Invalid Email/Mobile or password"
            }, {
                status: 401
            });
        }
        if (Number(user.status) !== 1) {
            return Response.json({
                success: false,
                message: "Your account is inactive. Please contact support."
            }, {
                status: 403
            });
        }
        const ok = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ocVerifyPassword"])(password, user.salt, user.password);
        if (!ok) {
            return Response.json({
                success: false,
                message: "Invalid login or password"
            }, {
                status: 401
            });
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSession"])({
            affiliate_user_id: Number(user.affiliate_user_id),
            affiliate_id: Number(user.affiliate_id),
            email: String(user.email || ""),
            telephone: String(user.telephone || ""),
            firstname: String(user.firstname || ""),
            lastname: String(user.lastname || "")
        });
        return Response.json({
            success: true,
            loggedIn: true,
            message: "Logged in",
            user: {
                affiliate_user_id: Number(user.affiliate_user_id),
                affiliate_id: Number(user.affiliate_id),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                telephone: user.telephone
            }
        });
    } catch (e) {
        console.error("Login failed:", e);
        return Response.json({
            success: false,
            message: "Login failed",
            error: ("TURBOPACK compile-time truthy", 1) ? String(e?.message || e) : "TURBOPACK unreachable"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bface7ca._.js.map