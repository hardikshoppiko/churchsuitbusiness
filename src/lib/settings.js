import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

// ---- Core DB loader (always fresh) ----
async function loadSettingsFromDB(store_id = 0) {
  const [rows] = await db.query("SELECT code, `key`, value FROM setting WHERE store_id = ?", [store_id]);

  const grouped = {};
  for (const r of rows) {
    if (!grouped[r.code]) grouped[r.code] = {};
    grouped[r.code][r.key] = r.value;
  }
  return grouped;
}

function getCachedSettings(store_id) {
  return unstable_cache(
    async () => loadSettingsFromDB(store_id),
    ["site_settings", String(store_id)],
    { revalidate: 300 }
  )();
}

export async function getSiteSettings(store_id = 0) {
  const isDev = process.env.NODE_ENV !== "production";
  return isDev ? loadSettingsFromDB(store_id) : getCachedSettings(store_id);
}

/**
 * ✅ Only fields you are OK exposing in HTML/Redux
 * Add/remove keys here as needed.
 */
export function pickPublicSettings(settingsData = {}) {
  const cfg = settingsData?.config || {};

  return {
    config: {
      config_maintenance: cfg.config_maintenance,
      config_name: cfg.config_name,
      config_logo: cfg.config_logo,
      config_icon: cfg.config_icon,
      config_country_id: cfg.config_country_id,
      config_zone_id: cfg.config_zone_id,
      config_address: cfg.config_address,
      config_email: cfg.config_email,
      config_telephone: cfg.config_telephone,
      // add ONLY non-sensitive fields
    },
  };
}