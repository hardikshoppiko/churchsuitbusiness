import { db } from "@/lib/db";
import { dbEscape } from "@/lib/db-utils";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const send_log_id = Number(searchParams.get("id") || 0);
  const to = String(searchParams.get("to") || "/").trim();

  if (send_log_id) {
    await db.query(`
      UPDATE affiliate_automation_send_log
      SET clicked=1, clicked_at=IFNULL(clicked_at, NOW())
      WHERE send_log_id='${send_log_id}'
      LIMIT 1
    `);
  }

  return Response.redirect(new URL(to, process.env.APP_URL || "http://localhost:3000"), 302);
}