import { redirect } from "next/navigation";

import ResetPasswordForm from "./ResetPasswordForm";
import { db } from "@/lib/db";

export const metadata = {
  title: `Reset Password | ${process.env.NEXT_PUBLIC_STORE_NAME} Affiliate Program`,
  description: `Reset your password for ${process.env.NEXT_PUBLIC_STORE_NAME} Affiliate Program account. Enter your new password to regain access to your affiliate dashboard and continue promoting our products.`,
};

async function getUserByCode(code) {
  const c = String(code || "").trim();

  if (!c) {
    return null;
  }

  const [rows] = await db.query(`SELECT affiliate_user_id, affiliate_id, email, telephone FROM affiliate_user WHERE code = ? AND code != '' LIMIT 1`, [c]);

  return rows?.[0] || null;
}

export default async function ResetPage(props) {
  const sp = await props.searchParams;
  const code = String(sp?.code || "").trim();

  const user = await getUserByCode(code);

  if (!user) {
      redirect("/account/login?msg=" + encodeURIComponent("Reset link is expired. Please request a new one.")
    );
  }

  return (
    <main className="min-h-[calc(100vh-70px)] bg-muted/40">
      <div className="container flex min-h-[calc(100vh-70px)] items-center justify-center py-8">
        {/* client side uses only code string, NO DB */}
        <ResetPasswordForm code={code} />
      </div>
    </main>
  );
}