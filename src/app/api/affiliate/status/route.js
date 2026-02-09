import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const affiliate_id = Number(searchParams.get("affiliate_id") || 0);

  if (!affiliate_id) {
    return Response.json({ message: "affiliate_id is required" }, { status: 400 });
  }

  const [rows] = await db.query(`SELECT affiliate_id, affiliate_status_id, status, approved FROM affiliate WHERE affiliate_id=${affiliate_id} LIMIT 1`);

  if (!rows?.length) {
    return Response.json({ message: "Affiliate not found" }, { status: 404 });
  }

  return Response.json(rows[0]);
}