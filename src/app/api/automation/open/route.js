import { db } from "@/lib/db";
import { dbEscape } from "@/lib/db-utils";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const send_log_id = Number(searchParams.get("id") || 0);

  if (send_log_id) {
    await db.query(`
      UPDATE affiliate_automation_send_log
      SET opened=1, opened_at=IFNULL(opened_at, NOW())
      WHERE send_log_id='${send_log_id}'
      LIMIT 1
    `);
  }

  // 1x1 transparent gif
  const gif = Buffer.from(
    "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
    "base64"
  );

  return new Response(gif, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}