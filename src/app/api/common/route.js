import { NextResponse } from "next/server";

import { sendSubscriptionActivatedEmail, sendSubscriptionRenewedEmail, sendSubscriptionUpdatedEmail, sendPaymentFailedEmail } from "@/lib/email";

// IMPORTANT for SendGrid
export const runtime = "nodejs";

export async function GET() {

  // // New Affiliate Create Email
  // await sendSubscriptionActivatedEmail({
  //   to: 'hardik.shoppiko@gmail.com',
  //   name: 'Hardik Shah',
  //   affiliateId: 1
  // });

  // // Affiliate Subscription re-newal email, next cycle email
  // await sendSubscriptionRenewedEmail({
  //   to: 'hardik.shoppiko@gmail.com',
  //   name: 'Hardik Shah',
  //   affiliateId: 1,
  //   amount: 89,
  //   invoiceId: 'INV-DEMO-001'
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
  //   name: 'Hardik Shah',
  //   invoiceId: 'INV-DEMO-001',
  //   affiliateId: 1,
  // });

  console.log('send demo email to customer!');

  return NextResponse.json({
    success: true,
    message: "Dummy Email for testing sent successfully."
  });
}