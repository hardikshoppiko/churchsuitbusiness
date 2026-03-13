import { NextResponse } from "next/server";

import { money } from "@/lib/db-utils";

import { sendSubscriptionActivatedEmail, sendSubscriptionRenewedEmail, sendSubscriptionUpdatedEmail, sendPaymentFailedEmail } from "@/lib/email";

// IMPORTANT for SendGrid
export const runtime = "nodejs";

export async function GET() {

  // // New Affiliate Create Email
  // await sendSubscriptionActivatedEmail({
  //   to: 'hardik.shoppiko@gmail.com',
  //   name: 'Hardik Shah',
  //   affiliateId: 1,
  //   store_name: 'Women Sunday Suits',
  //   fees: money(89),
  //   telephone: 2018887493,
  //   start_date: '03/13/2026',
  //   end_date: '04/12/2026'
  // });

  // // Affiliate Subscription re-newal email, next cycle email
  // await sendSubscriptionRenewedEmail({
  //   to: 'hardik.shoppiko@gmail.com',
  //   name: 'Hardik Shah',
  //   affiliateId: 1,
  //   store_name: 'Women Sunday Suits',
  //   amount: money(89),
  //   invoiceId: 'INV-DEMO-001',
  //   end_date: '04/12/2026'
  // });

  // // Affiliate Subscription Update Email
  // await sendSubscriptionUpdatedEmail({
  //   to: 'hardik.shoppiko@gmail.com',
  //   name: 'Hardik Shah',
  //   affiliateId: 1
  // });

  // // Payment Failed Dummy email!
  // await sendPaymentFailedEmail({
  //   to: 'hardik.shoppiko@gmail.com',
  //   name: 'Cheryll Norton',
  //   store_name: 'Goddess Church Suits',
  //   invoiceId: 'in_1SqQ8XGfgBXyKatDTuyeKCg2',
  //   affiliateId: 2839
  // });

  console.log('send demo email to customer!');

  return NextResponse.json({
    success: true,
    message: "Dummy Email for testing sent successfully."
  });
}