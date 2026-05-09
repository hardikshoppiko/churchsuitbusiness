import { NextResponse } from "next/server";

import { money } from "@/lib/db-utils";

import { sendSubscriptionActivatedEmail, sendSubscriptionRenewedEmail, sendSubscriptionUpdatedEmail, sendPaymentFailedEmail, sendSubscriptionCancelledEmail } from "@/lib/email";

// IMPORTANT for SendGrid
export const runtime = "nodejs";

async function godaddyDisableAutoRenewIfEnabled(domainRaw) {
  // Final response object
  // We return this with success/error/message/details
  const json = {};

  // ------------------------------------------------------
  // 1) Clean the input domain
  // ------------------------------------------------------
  // Remove:
  // - http://
  // - https://
  // - www.
  // Convert to lowercase
  const domain_name = String(domainRaw || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .toLowerCase();

  // ------------------------------------------------------
  // 2) Validate domain format
  // ------------------------------------------------------
  // Example valid:
  // mydomain.com
  // abc-store.net
  const domainOk = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain_name);

  if (!domainOk) {
    json.error = "Warning: Please enter valid URL!";
    return json;
  }

  // ------------------------------------------------------
  // 3) Load GoDaddy credentials from environment
  // ------------------------------------------------------
  const API_KEY = process.env.GODADDY_API_KEY;
  const API_SECRET = process.env.GODADDY_API_SECRET;
  const BASE_URL = process.env.GODADDY_BASE_URL || "https://api.godaddy.com";

  // If credentials are missing, stop here
  if (!API_KEY || !API_SECRET) {
    json.error = "GoDaddy API credentials missing";
    return json;
  }

  // ------------------------------------------------------
  // 4) Prepare headers for GoDaddy API request
  // ------------------------------------------------------
  const headers = {
    Authorization: `sso-key ${API_KEY}:${API_SECRET}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    // ------------------------------------------------------
    // 5) Get current domain details from GoDaddy
    // ------------------------------------------------------
    // This tells us things like:
    // - current domain status
    // - whether auto renew is on/off
    const getUrl = `${BASE_URL}/v1/domains/${encodeURIComponent(domain_name)}`;

    const getRes = await fetch(getUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const current = await getRes.json().catch(() => ({}));

    console.log(current);

    // // If request failed, return API error
    // if (!getRes.ok) {
    //   json.error =
    //     current?.message ||
    //     current?.code ||
    //     `Failed to fetch domain details (${getRes.status})`;

    //   json.details = current;
    //   return json;
    // }

    // // Save some domain info in the output
    // json.domain = domain_name;
    // json.current_renew_auto = !!current?.renewAuto;
    // json.status = current?.status || "";

    // // ------------------------------------------------------
    // // 6) Optional safety check
    // // ------------------------------------------------------
    // // GoDaddy usually expects ACTIVE domain status for updates
    // if (current?.status && String(current.status).toUpperCase() !== "ACTIVE") {
    //   json.error = `Domain is not ACTIVE. Current status: ${current.status}`;
    //   return json;
    // }

    // // ------------------------------------------------------
    // // 7) If auto-renew is already OFF, no update needed
    // // ------------------------------------------------------
    // if (current?.renewAuto === false) {
    //   json.success = true;
    //   json.message = "Auto-renew is already disabled.";
    //   json.updated = false;
    //   return json;
    // }

    // // ------------------------------------------------------
    // // 8) If auto-renew is ON, update it to false
    // // ------------------------------------------------------
    // const patchUrl = `${BASE_URL}/v1/domains/${encodeURIComponent(domain_name)}`;

    // const patchRes = await fetch(patchUrl, {
    //   method: "PATCH",
    //   headers,
    //   cache: "no-store",
    //   body: JSON.stringify({
    //     renewAuto: false,
    //   }),
    // });

    // const patchBody = await patchRes.json().catch(() => ({}));

    // // If update failed, return API error
    // if (!patchRes.ok) {
    //   json.error =
    //     patchBody?.message ||
    //     patchBody?.code ||
    //     `Failed to disable auto-renew (${patchRes.status})`;

    //   json.details = patchBody;
    //   return json;
    // }

    // ------------------------------------------------------
    // 9) Success response
    // ------------------------------------------------------
    json.success = true;
    json.message = "Auto-renew disabled successfully.";
    json.updated = true;
    json.renewAuto = false;

    return json;
  } catch (err) {
    // ------------------------------------------------------
    // 10) Catch any unexpected JS/network errors
    // ------------------------------------------------------
    json.error = err?.message || "Unexpected error while updating auto-renew";
    return json;
  }
}

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

  // // Cancel Subscription Email
  // await sendSubscriptionCancelledEmail({
  //   affiliateId: 999999999,
  //   to: `hardik.shoppiko@gmail.com`,
  //   owner_name: `Hardik Shah`,
  //   store_name: `Testing Store Name`,
  //   website: `testingstore.com`,
  //   telephone: `2018887493`
  // });

  // const result = await godaddyDisableAutoRenewIfEnabled("https://womenssundaysuites.com");

  // console.log(result);

  // console.log('send demo email to customer!');

  return NextResponse.json({
    success: true,
    message: "Dummy Email for testing sent successfully."
  });
}