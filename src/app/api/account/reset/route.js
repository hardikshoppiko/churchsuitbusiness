export const runtime = "nodejs";

import { db } from "@/lib/db";
import { generateSalt, ocHashPassword } from "@/lib/db-utils";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const code = String(body?.code || "").trim();
    const password = String(body?.password || "");
    const confirm = String(body?.confirm || "");

    if (!code) {
      return Response.json({ ok: false, message: "Reset code is required" }, { status: 400 });
    }

    // PHP rules (from your language file): 5..20 and confirm match
    if (password.length < 5 || password.length > 20) {
      return Response.json(
        { ok: false, message: "Password must be between 5 and 20 characters!" },
        { status: 400 }
      );
    }

    if (confirm !== password) {
      return Response.json(
        { ok: false, message: "Password and password confirmation do not match!" },
        { status: 400 }
      );
    }

    // console.log(`SELECT affiliate_user_id, affiliate_id FROM affiliate_user WHERE code = ? AND code != '' LIMIT 1`,[code]); return false;

    // Find user by code (like getUserByCode)
    const [rows] = await db.query(`SELECT affiliate_user_id, affiliate_id FROM affiliate_user WHERE code = ? AND code != '' LIMIT 1`,[code]);

    const user = rows?.[0] || null;

    if (!user) {
      // same UX as PHP: code invalid/expired
      return Response.json(
        { ok: false, message: "Reset link is expired. Please request a new one." },
        { status: 404 }
      );
    }

    // OpenCart salt + hash
    const salt = generateSalt();
    const hash = ocHashPassword(password, salt);

    // Update password + clear code
    // await db.query(`UPDATE affiliate_user SET salt = ?, password = ?, code = '', date_modified = NOW() WHERE affiliate_user_id = ? AND affiliate_id = ? LIMIT 1`, [salt, hash, Number(user.affiliate_user_id), Number(user.affiliate_id)]);

    await db.query(`UPDATE affiliate_user SET salt = '${salt}', password = '${hash}', code = '', date_modified = NOW() WHERE affiliate_user_id = ${user.affiliate_user_id} AND affiliate_id = ${user.affiliate_id} LIMIT 1`);

    return Response.json({ ok: true, message: "Success: Your password has been successfully updated." });
  } catch (e) {
    console.error("Reset password error:", e);
    return Response.json({ ok: false, message: "Server error. Please try again." }, { status: 500 });
  }
}