import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/lib/util.js

/**
 * formatDateTime
 *
 * @param {number|string|Date} value
 * @param {Object} options
 * @param {boolean} options.unixSeconds  // true if value is unix timestamp in seconds (Stripe)
 * @param {boolean} options.withTime     // include time or only date
 */
export function formatDateTime(value, options = {}) {
  const { unixSeconds = false, withTime = false } = options;

  if (!value) return "—";

  try {
    let date;

    if (unixSeconds) {
      date = new Date(Number(value) * 1000);
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) return String(value);

    const formatOptions = withTime
      ? {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      : {
          year: "numeric",
          month: "short",
          day: "2-digit",
        };

    return date.toLocaleString("en-US", formatOptions);
  } catch {
    return String(value);
  }
}

export function daysLeft(endDate) {
  if (!endDate) return null;
  const end = new Date(endDate).getTime();
  if (!end) return null;
  const diff = end - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function normalizeWebsite(url) {
  const v = String(url || "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}
