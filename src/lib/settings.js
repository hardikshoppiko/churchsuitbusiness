import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

// ---- Core DB loader (always fresh) ----
async function loadSettingsFromDB(store_id = 0) {
  const [rows] = await db.query(
    "SELECT code, `key`, value FROM setting WHERE store_id = ?",
    [store_id]
  );

  // group by code -> key -> value (OpenCart-style)
  const grouped = {};
  for (const r of rows) {
    if (!grouped[r.code]) grouped[r.code] = {};
    grouped[r.code][r.key] = r.value;
  }
  return grouped;
}

/**
 * Production cached wrapper:
 * - caches result per store_id
 * - revalidates every 5 minutes (change as you want)
 */
function getCachedSettings(store_id) {
  return unstable_cache(
    async () => loadSettingsFromDB(store_id),
    ["site_settings", String(store_id)], // cache key
    { revalidate: 300 } // seconds (300 = 5 minutes)
  )();
}

/**
 * Public function:
 * - Dev: NO cache (fresh DB every time)
 * - Prod: cached + revalidate
 */
export async function getSiteSettings(store_id = 0) {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    return loadSettingsFromDB(store_id); // no cache in dev
  }

  return getCachedSettings(store_id); // cached in prod
}