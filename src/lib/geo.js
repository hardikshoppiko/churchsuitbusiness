import { db } from "@/lib/db";

export async function getCountries() {
  const [rows] = await db.query(
    "SELECT country_id, name FROM country ORDER BY name ASC"
  );

  return rows.map((r) => ({
    country_id: Number(r.country_id),
    name: r.name,
  }));
}

export async function getZonesByCountryId(country_id) {
  const [rows] = await db.query(
    "SELECT zone_id, country_id, name FROM zone WHERE country_id = ? ORDER BY name ASC",
    [Number(country_id)]
  );

  return rows.map((r) => ({
    zone_id: Number(r.zone_id),
    country_id: Number(r.country_id),
    name: r.name,
  }));
}