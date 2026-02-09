// src/app/api/account/login/route.js
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { ocVerifyPassword, isTenDigitPhone, normalizeLogin } from "@/lib/db-utils";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    // console.log(body);

    const username = normalizeLogin(body.username); // email OR phone
    const password = String(body.password || "");

    if (!username) {
      return Response.json({ success: false, message: "Email or phone is required" }, { status: 400 });
    }
    if (!password) {
      return Response.json({ success: false, message: "Password is required" }, { status: 400 });
    }

    const isPhone = isTenDigitPhone(username);

    const [rows] = await db.query(
      isPhone
        ? "SELECT * FROM affiliate_user WHERE REPLACE(telephone,' ','')=? LIMIT 1"
        : "SELECT * FROM affiliate_user WHERE LOWER(email)=LOWER(?) LIMIT 1",
      [username]
    );

    const user = rows?.[0];
    if (!user) {
      return Response.json({ success: false, message: "Invalid Email/Mobile or password" }, { status: 401 });
    }

    if (Number(user.status) !== 1) {
      return Response.json(
        { success: false, message: "Your account is inactive. Please contact support." },
        { status: 403 }
      );
    }

    const ok = ocVerifyPassword(password, user.salt, user.password);
    if (!ok) {
      return Response.json({ success: false, message: "Invalid login or password" }, { status: 401 });
    }

    await createSession({
      affiliate_user_id: Number(user.affiliate_user_id),
      affiliate_id: Number(user.affiliate_id),
      email: String(user.email || ""),
      telephone: String(user.telephone || ""),
      firstname: String(user.firstname || ""),
      lastname: String(user.lastname || ""),
    });

    return Response.json({
      success: true,
      loggedIn: true,
      message: "Logged in",
      user: {
        affiliate_user_id: Number(user.affiliate_user_id),
        affiliate_id: Number(user.affiliate_id),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        telephone: user.telephone,
      },
    });
  } catch (e) {
    console.error("Login failed:", e);
    return Response.json(
      { success: false, message: "Login failed", error: process.env.NODE_ENV !== "production" ? String(e?.message || e) : undefined },
      { status: 500 }
    );
  }
}