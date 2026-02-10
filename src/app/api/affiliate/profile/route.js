export const runtime = "nodejs";

// import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  dbEscape,
  isEmail,
  isTenDigitPhone,
  generateSalt,
  ocHashPassword,
  getClientIp,
} from "@/lib/db-utils";

function clean(v) {
  return String(v ?? "").trim();
}

async function getAffiliateById(affiliate_id) {
  const id = Number(affiliate_id || 0);
  if (!id) return null;

  const [rows] = await db.query(`
    SELECT
      affiliate_id,
      firstname,
      lastname,
      email,
      telephone,
      store_name
    FROM affiliate
    WHERE affiliate_id='${id}' AND is_delete=0
    LIMIT 1
  `);

  return rows?.[0] || null;
}

export async function GET() {
  const session = await getSession();

  // const cookieStore = await cookies();
  // console.log("COOKIE ALL:", cookieStore.getAll());
  // console.log("COOKIE wsf_session:", cookieStore.get("wsf_session"));

  // console.log(`session: ${JSON.stringify(session)}`);

  if (!session?.affiliate_id) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const affiliate = await getAffiliateById(session.affiliate_id);
  if (!affiliate) {
    return Response.json({ ok: false, message: "Affiliate not found" }, { status: 404 });
  }

  return Response.json({ ok: true, affiliate });
}

export async function PATCH(req) {
  const session = await getSession();
  if (!session?.affiliate_id) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const affiliate_id = Number(session.affiliate_id);
  const affiliate_user_id = Number(session.affiliate_user_id || 0);
  const body = await req.json().catch(() => ({}));
  const ip = getClientIp(req);

  const firstname = clean(body.firstname);
  const lastname = clean(body.lastname);
  const email = clean(body.email).toLowerCase();
  const telephone = clean(body.telephone);
  const store_name = clean(body.store_name);

  const password = clean(body.password);
  const confirm = clean(body.confirm);

  // -----------------------
  // Validations
  // -----------------------
  if (!firstname || firstname.length < 1 || firstname.length > 32) {
    return Response.json({ ok: false, message: "First name must be between 1 and 32 characters" }, { status: 400 });
  }

  if (!lastname || lastname.length < 1 || lastname.length > 32) {
    return Response.json({ ok: false, message: "Last name must be between 1 and 32 characters" }, { status: 400 });
  }

  if (!email || !isEmail(email)) {
    return Response.json({ ok: false, message: "Please enter a valid email address" }, { status: 400 });
  }

  if (!telephone || !isTenDigitPhone(telephone)) {
    return Response.json({ ok: false, message: "Mobile must be maximum 10 digit & must be numeric!" }, { status: 400 });
  }

  if (!store_name || store_name.length < 2 || store_name.length > 64) {
    return Response.json({ ok: false, message: "Store name must be between 2 and 64 characters" }, { status: 400 });
  }

  // -----------------------
  // Uniqueness checks (affiliate)
  // -----------------------
  const [emailRows] = await db.query(`
    SELECT affiliate_id
    FROM affiliate
    WHERE LOWER(email)=LOWER('${dbEscape(email)}')
      AND affiliate_id <> ${affiliate_id}
      AND is_delete=0
    LIMIT 1
  `);
  if (emailRows?.length) {
    return Response.json({ ok: false, message: "E-Mail Address is already registered!" }, { status: 409 });
  }

  const [telRows] = await db.query(`
    SELECT affiliate_id
    FROM affiliate
    WHERE telephone='${dbEscape(telephone)}'
      AND affiliate_id <> ${affiliate_id}
      AND is_delete=0
    LIMIT 1
  `);
  if (telRows?.length) {
    return Response.json({ ok: false, message: "Mobile already exists!" }, { status: 409 });
  }

  // Optional uniqueness checks within affiliate_user for same affiliate
  if (affiliate_user_id) {
    const [uEmailRows] = await db.query(`
      SELECT affiliate_user_id
      FROM affiliate_user
      WHERE LOWER(email)=LOWER('${dbEscape(email)}')
        AND affiliate_user_id <> ${affiliate_user_id}
        AND affiliate_id='${affiliate_id}'
        AND is_delete=0
      LIMIT 1
    `);
    if (uEmailRows?.length) {
      return Response.json({ ok: false, message: "E-Mail Address is already registered!" }, { status: 409 });
    }
  }

  // -----------------------
  // Password update (both tables)
  // -----------------------
  let passwordSqlAffiliate = "";
  let passwordSqlAffiliateUser = "";

  if (password || confirm) {
    if (!password || password.length < 6 || password.length > 20) {
      return Response.json({ ok: false, message: "Password must be between 6 and 20 characters" }, { status: 400 });
    }
    if (password !== confirm) {
      return Response.json({ ok: false, message: "Passwords do not match" }, { status: 400 });
    }

    const salt = generateSalt();
    const hashed = ocHashPassword(password, salt);

    passwordSqlAffiliate = `,
      password='${dbEscape(hashed)}',
      salt='${dbEscape(salt)}'
    `;

    passwordSqlAffiliateUser = `,
      password='${dbEscape(hashed)}',
      salt='${dbEscape(salt)}'
    `;
  }

  // -----------------------
  // 1) Update affiliate (main table)
  // -----------------------
  await db.query(`
    UPDATE affiliate SET
      firstname='${dbEscape(firstname)}',
      lastname='${dbEscape(lastname)}',
      email='${dbEscape(email)}',
      telephone='${dbEscape(telephone)}',
      store_name='${dbEscape(store_name)}'${passwordSqlAffiliate},
      ip='${dbEscape(ip)}',
      date_modified=NOW()
    WHERE affiliate_id='${affiliate_id}'
    LIMIT 1
  `);

  // -----------------------
  // 2) Update affiliate_user (logged user only)
  // -----------------------
  if (affiliate_user_id) {
    const [uRows] = await db.query(`
      SELECT affiliate_user_id
      FROM affiliate_user
      WHERE affiliate_user_id='${affiliate_user_id}'
        AND affiliate_id='${affiliate_id}'
        AND is_delete=0
      LIMIT 1
    `);

    if (uRows?.length) {
      await db.query(`
        UPDATE affiliate_user SET
          username='${dbEscape(email)}',
          firstname='${dbEscape(firstname)}',
          lastname='${dbEscape(lastname)}',
          email='${dbEscape(email)}',
          telephone='${dbEscape(telephone)}'${passwordSqlAffiliateUser},
          ip='${dbEscape(ip)}',
          date_modified=NOW()
        WHERE affiliate_user_id='${affiliate_user_id}'
          AND affiliate_id='${affiliate_id}'
        LIMIT 1
      `);
    }
  }

  const updated = await getAffiliateById(affiliate_id);

  return Response.json({
    ok: true,
    message: "Success: Your account has been updated!",
    affiliate: updated,
  });
}