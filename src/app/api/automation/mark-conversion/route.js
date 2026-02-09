import { db } from "@/lib/db";

// Conversion Query
// // Leads (status 15) conversion by template
// SELECT
//   l.template_code,
//   COUNT(*) AS total_sent,
//   SUM(l.opened=1) AS opened,
//   SUM(l.clicked=1) AS clicked,
//   SUM(l.converted=1) AS converted
// FROM affiliate_automation_send_log l
// WHERE l.channel='email'
// GROUP BY l.template_code
// ORDER BY converted DESC, clicked DESC;

// // “Which email gets credit” (attribution)

// SELECT
//   l.template_code,
//   COUNT(*) AS conversions_credited
// FROM affiliate_automation_send_log l
// WHERE l.conversion_source_send_log_id = l.send_log_id
// GROUP BY l.template_code
// ORDER BY conversions_credited DESC;

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const affiliate_id = Number(body.affiliate_id || 0);

  if (!affiliate_id) return Response.json({ message: "affiliate_id required" }, { status: 400 });

  // find last clicked email for this affiliate
  const [clicked] = await db.query(`SELECT send_log_id FROM affiliate_automation_send_log WHERE affiliate_id='${affiliate_id}' AND channel='email' AND clicked=1 ORDER BY clicked_at DESC LIMIT 1`);

  let creditId = clicked?.[0]?.send_log_id || null;

  // fallback: last sent email
  if (!creditId) {
    const [sent] = await db.query(`SELECT send_log_id FROM affiliate_automation_send_log WHERE affiliate_id='${affiliate_id}' AND channel='email' AND sent_at IS NOT NULL ORDER BY sent_at DESC LIMIT 1`);
    creditId = sent?.[0]?.send_log_id || null;
  }

  // mark all logs for affiliate as converted (optional),
  // but credit only one message
  await db.query(`UPDATE affiliate_automation_send_log SET converted=1, converted_at=NOW(), converted_status_id=100, conversion_source_send_log_id='${creditId ? Number(creditId) : "NULL"}' WHERE affiliate_id='${affiliate_id}'`);

  return Response.json({ ok: true, affiliate_id, credited_send_log_id: creditId });
}