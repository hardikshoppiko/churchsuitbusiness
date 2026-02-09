import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";
import { serialize as phpSerialize } from "php-serialize";

/**
 * shadcn utility: merges tailwind classes safely
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function sha1(str) {
  return crypto.createHash("sha1").update(String(str)).digest("hex");
}

// OpenCart-compatible 9-char salt
export function generateSalt() {
  return crypto
    .createHash("md5")
    .update(crypto.randomBytes(16).toString("hex") + Date.now())
    .digest("hex")
    .substring(0, 9);
}

// OpenCart hash: sha1(salt . sha1(salt . sha1(password)))
export function ocHashPassword(password, salt) {
  return sha1(salt + sha1(salt + sha1(password)));
}

export function ocVerifyPassword(inputPassword, storedSalt, storedHash) {
  return ocHashPassword(inputPassword, storedSalt) === storedHash;
}

// OpenCart-style db escape (like $this->db->escape)
export function dbEscape(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\u0008/g, "\\b")
    .replace(/\t/g, "\\t")
    .replace(/\0/g, "\\0")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\u001a/g, "\\Z")
    .replace(/\x1a/g, "\\Z")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}

// Save only domain (remove https:// and www)
export function stripWebsite(url = "") {
  return String(url)
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

export function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
}

export function isTenDigitPhone(v) {
  return /^\d{10}$/.test(String(v || "").trim());
}

export function normalizeLogin(v) {
  return String(v || "").trim();
}

export function ocSerialize(value) {
  return phpSerialize(value);
}

export function isTruthy(v) {
  return v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true";
}

export function getClientIp(req) {
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

export function getFrontClientIp() {
  const h = headers();

  // Common proxy headers
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();

  // Fallback
  return "0.0.0.0";
}

export function money(v) {
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

/**
 * Format date as MM/DD/YYYY (default)
 */
export function formatDate(input, format = "MM/DD/YYYY") {
  const d = parseDate(input);

  if (!d) return "";

  const map = {
    DD: String(d.getDate()).padStart(2, "0"),
    MM: String(d.getMonth() + 1).padStart(2, "0"),
    YYYY: d.getFullYear(),
    HH: String(d.getHours()).padStart(2, "0"),
    mm: String(d.getMinutes()).padStart(2, "0"),
    ss: String(d.getSeconds()).padStart(2, "0"),
  };

  return format.replace(/DD|MM|YYYY|HH|mm|ss/g, (k) => map[k]);
}