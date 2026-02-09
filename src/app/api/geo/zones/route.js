import { getZonesByCountryId } from "@/lib/geo";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country_id = searchParams.get("country_id");

  if (!country_id) {
    return Response.json({ message: "country_id is required" }, { status: 400 });
  }

  const zones = await getZonesByCountryId(country_id);
  return Response.json({ zones });
}