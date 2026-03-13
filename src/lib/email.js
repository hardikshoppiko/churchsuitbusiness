// src/lib/email.js
import { sendHtml } from "@/lib/sendgrid-email";

export async function sendPaymentFailedEmail({ to, name, store_name, invoiceId, affiliateId }) {
  const brandName = process.env.STORE_NAME || "Church Suits Business";
  const supportPhone = "908-297-8710";

  const displayName = name ? String(name).trim() : "Valued Partner";
  const safeStoreName = store_name ? String(store_name).trim() : displayName;
  const safeInvoiceId = invoiceId ? String(invoiceId).trim() : "N/A";
  const safeAffiliateId = affiliateId ? String(affiliateId).trim() : "N/A";

  const subject = `Oops! Your Website Payment Failed for ${safeStoreName} | ${brandName}`;

  const paymentUrl = `${process.env.APP_URL}/register/payment/${affiliateId}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f6f0ff; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background:linear-gradient(180deg, #f8f3ff 0%, #fffaff 100%); margin:0; padding:30px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px; background:#ffffff; border:1px solid #eadcff; border-radius:28px; overflow:hidden; box-shadow:0 20px 50px rgba(125,72,200,0.12);">
                
                <tr>
                  <td style="background:linear-gradient(135deg, #8e57d8 0%, #7d48c8 55%, #6d38bb 100%); padding:36px 30px; text-align:center;">
                    <div style="font-size:13px; line-height:1; letter-spacing:1.6px; text-transform:uppercase; color:#f4eefe; font-weight:700;">
                      ${brandName}
                    </div>
                    <div style="margin-top:14px; font-size:32px; line-height:1.2; font-weight:700; color:#ffffff;">
                      Payment Failed
                    </div>
                    <div style="margin-top:10px; font-size:15px; line-height:1.85; color:#efe7ff;">
                      Please update your payment method to keep your website and services active.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:34px 30px 18px;">
                    <div style="font-size:24px; line-height:1.3; font-weight:700; color:#111827;">
                      Hello ${safeStoreName},
                    </div>

                    <div style="margin-top:14px; font-size:15px; line-height:1.9; color:#4b5563;">
                      Oops! It looks like your recent payment to <strong>We Ship Fashions - Dropshipping Website</strong> failed. No need to worry — it happens. Please update your payment method through your backend, or contact us at <strong>${supportPhone}</strong> to continue with your payment.
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px; border:1px solid #eadcff; border-radius:22px; background:#fcf9ff;">
                      <tr>
                        <td style="padding:22px 22px;">
                          <div style="font-size:13px; line-height:1.4; font-weight:700; letter-spacing:0.03em; text-transform:uppercase; color:#7d48c8;">
                            Payment Details
                          </div>

                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:14px;">
                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280; width:150px;">
                                Store Name
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${safeStoreName}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280;">
                                Invoice ID
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${safeInvoiceId}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280;">
                                Support Number
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${supportPhone}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px; border:1px solid #f5d0fe; border-radius:20px; background:#fff7fb;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <div style="font-size:15px; line-height:1.5; font-weight:700; color:#a21caf;">
                            Important Reminder
                          </div>
                          <div style="margin-top:8px; font-size:14px; line-height:1.85; color:#4b5563;">
                            Your website will stop working in the next <strong>3 days</strong> if payment does not go through. Please update your payment method as soon as possible to avoid service interruption.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:10px; border:1px solid #eadcff; border-radius:18px; background:#fffaff;">
                      <tr>
                        <td style="padding:18px 18px;">
                          <div style="font-size:15px; line-height:1.5; font-weight:700; color:#7d48c8;">
                            Need help?
                          </div>
                          <div style="margin-top:8px; font-size:14px; line-height:1.85; color:#4b5563;">
                            If you need assistance updating your payment details, please contact our team at <strong>${supportPhone}</strong>.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 30px 30px; border-top:1px solid #f3e8ff; background:#fffcff;">
                    <div style="font-size:13px; line-height:1.9; color:#6b7280;">
                      Warm Regards,<br />
                      <span style="font-weight:700; color:#374151;">${brandName}</span>
                    </div>

                    <div style="margin-top:14px; font-size:12px; line-height:1.8; color:#9ca3af;">
                      This is an automated payment notification. Please do not reply directly to this email.
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
Hello ${safeStoreName},

Oops! It looks like your recent payment to We Ship Fashions - Dropshipping Website failed. No need to worry, it happens.

Please update your payment method through your backend or contact us at ${supportPhone} to continue with your payment.

Payment Details:
- Store Name: ${safeStoreName}
- Invoice ID: ${safeInvoiceId}
- Affiliate ID: ${safeAffiliateId}

Your website will stop working in the next 3 days if payment does not go through.

Update Payment Method:
${paymentUrl}

Warm Regards,
We Ship Fashion Team
  `.trim();

  // For testing only
  // const to_email = to;
  const to_email = "hardik.shoppiko@gmail.com";

  try {
    await sendHtml(to_email, subject, html, text);
  } catch (e) {
    console.log("Email failed", e);
  }
}

export async function sendSubscriptionActivatedEmail({ to, name, affiliateId, store_name, fees, telephone, start_date, end_date }) {
  const brandName = process.env.STORE_NAME || "Church Suits Business";
  const safeStoreName = store_name ? String(store_name).trim() : "Your Store";

  const subject = `Welcome ${safeStoreName} - Subscription Activated Successfully | ${brandName}`;

  const dashboardUrl = `${process.env.APP_URL}/account`;
  const paymentUrl = `${process.env.APP_URL}/register/payment/${affiliateId}`;

  const safeName = name ? String(name).trim() : "Valued Partner";
  const safeFees = fees ? String(fees).trim() : "N/A";
  const safeTelephone = telephone ? String(telephone).trim() : "N/A";
  const safeStartDate = start_date ? String(start_date).trim() : "N/A";
  const safeEndDate = end_date ? String(end_date).trim() : "N/A";
  const safeAffiliateId = affiliateId ? String(affiliateId).trim() : "N/A";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f6f0ff; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background:linear-gradient(180deg, #f8f3ff 0%, #fffaff 100%); margin:0; padding:30px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px; background:#ffffff; border:1px solid #eadcff; border-radius:28px; overflow:hidden; box-shadow:0 20px 50px rgba(125,72,200,0.12);">

                <tr>
                  <td style="background:linear-gradient(135deg, #a56ee8 0%, #8e57d8 55%, #7d48c8 100%); padding:36px 30px; text-align:center;">
                    <div style="font-size:13px; line-height:1; letter-spacing:1.6px; text-transform:uppercase; color:#f4eefe; font-weight:700;">
                      ${brandName}
                    </div>

                    <div style="margin-top:14px; font-size:32px; line-height:1.2; font-weight:700; color:#ffffff;">
                      Subscription Activated
                    </div>

                    <div style="margin-top:10px; font-size:15px; line-height:1.85; color:#efe7ff;">
                      Your account is active, your subscription is confirmed, and your dashboard is ready to use.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:34px 30px 18px;">
                    <div style="font-size:24px; line-height:1.3; font-weight:700; color:#111827;">
                      Welcome, ${safeName}!
                    </div>

                    <div style="margin-top:14px; font-size:15px; line-height:1.9; color:#4b5563;">
                      We’re pleased to confirm that your subscription has been activated successfully. Your business account is now live in our system, and you can begin managing your store information, billing details, and account setup directly from your dashboard.
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px; border:1px solid #eadcff; border-radius:22px; background:#fcf9ff;">
                      <tr>
                        <td style="padding:22px 22px;">
                          <div style="font-size:13px; line-height:1.4; font-weight:700; letter-spacing:0.03em; text-transform:uppercase; color:#7d48c8;">
                            Subscription Overview
                          </div>

                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:14px;">
                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280; width:160px;">
                                Store Name
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${safeStoreName}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280;">
                                Subscription Fee
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${safeFees}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280;">
                                Contact Number
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${safeTelephone}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280;">
                                Start Date
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${safeStartDate}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280;">
                                End Date
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${safeEndDate}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px; border:1px solid #f3e8ff; border-radius:20px; background:#fffaff;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <div style="font-size:15px; line-height:1.5; font-weight:700; color:#7d48c8;">
                            Subscription Period
                          </div>
                          <div style="margin-top:8px; font-size:14px; line-height:1.85; color:#4b5563;">
                            Your subscription is active from <strong>${safeStartDate}</strong> through <strong>${safeEndDate}</strong>. Please review your dashboard regularly for account updates and subscription activity.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
                      <tr>
                        <td align="left" style="padding:0 0 14px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" style="border-radius:14px; background:linear-gradient(135deg, #a56ee8 0%, #8e57d8 55%, #7d48c8 100%);">
                                <a href="${dashboardUrl}" style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:14px;">
                                  Open Dashboard
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                      <tr>
                        <td style="padding:0;">
                          <div style="font-size:14px; line-height:1.9; color:#6b7280;">
                            Your subscription is now active, and your account is ready for use. We’re excited to have you with us and look forward to supporting your business growth.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 30px 30px; border-top:1px solid #f3e8ff; background:#fffcff;">
                    <div style="font-size:13px; line-height:1.9; color:#6b7280;">
                      Thank you,<br />
                      <span style="font-weight:700; color:#374151;">${brandName} Team</span>
                    </div>

                    <div style="margin-top:14px; font-size:12px; line-height:1.8; color:#9ca3af;">
                      This is an automated message confirming your subscription activation.
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
Welcome, ${safeName}!

Your subscription has been activated successfully.

Your account is now active and ready to use.

Subscription Overview:
- Store Name: ${safeStoreName}
- Subscription Fee: ${safeFees}
- Contact Number: ${safeTelephone}
- Start Date: ${safeStartDate}
- End Date: ${safeEndDate}

Subscription Period:
Your subscription is active from ${safeStartDate} through ${safeEndDate}.

Open Dashboard:
${dashboardUrl}

Your subscription is active, and you can now manage your account and continue your business setup.

Thank you,
${brandName} Team

This is an automated message confirming your subscription activation.
  `.trim();

  // For testing only
  const to_email = "hardik.shoppiko@gmail.com";
  // const to_email = to;

  try {
    await sendHtml(to_email, subject, html, text);
  } catch (e) {
    console.log("Email failed", e);
  }
}

export async function sendSubscriptionRenewedEmail({ to, name, affiliateId, store_name, amount, invoiceId, end_date }) {
  const brandName = process.env.STORE_NAME || "Church Suits Business";

  const displayName = name ? String(name).trim() : "Valued Partner";
  const safeStoreName = store_name ? String(store_name).trim() : "Your Store";
  const safeAmount = amount;
  const safeInvoiceId = invoiceId ? String(invoiceId).trim() : "N/A";
  const safeEndDate = end_date ? String(end_date).trim() : "N/A";
  const safeAffiliateId = affiliateId ? String(affiliateId).trim() : "N/A";

  const subject = `Subscription Renewed for ${safeStoreName} | ${brandName}`;

  const dashboardUrl = `${process.env.APP_URL}/account`;
  const billingUrl = `${process.env.APP_URL}/register/payment/${affiliateId}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f6f0ff; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background:linear-gradient(180deg, #f8f3ff 0%, #fffaff 100%); margin:0; padding:30px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px; background:#ffffff; border:1px solid #eadcff; border-radius:28px; overflow:hidden; box-shadow:0 20px 50px rgba(125,72,200,0.12);">

                <tr>
                  <td style="background:linear-gradient(135deg, #a56ee8 0%, #8e57d8 55%, #7d48c8 100%); padding:36px 30px; text-align:center;">
                    <div style="font-size:13px; line-height:1; letter-spacing:1.6px; text-transform:uppercase; color:#f4eefe; font-weight:700;">
                      ${brandName}
                    </div>

                    <div style="margin-top:14px; font-size:32px; line-height:1.2; font-weight:700; color:#ffffff;">
                      Subscription Renewed
                    </div>

                    <div style="margin-top:10px; font-size:15px; line-height:1.85; color:#efe7ff;">
                      Your renewal payment has been processed successfully and your subscription remains active.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:34px 30px 18px;">
                    <div style="font-size:24px; line-height:1.3; font-weight:700; color:#111827;">
                      Hi ${displayName},
                    </div>

                    <div style="margin-top:14px; font-size:15px; line-height:1.9; color:#4b5563;">
                      Great news — your subscription has been renewed successfully for <strong>${safeStoreName}</strong>. Your account and services remain active without interruption, and your next billing period is now in effect.
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px; border:1px solid #eadcff; border-radius:22px; background:#fcf9ff;">
                      <tr>
                        <td style="padding:22px 22px;">
                          <div style="font-size:13px; line-height:1.4; font-weight:700; letter-spacing:0.03em; text-transform:uppercase; color:#7d48c8;">
                            Renewal Overview
                          </div>

                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:14px;">
                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280; width:165px;">
                                Store Name
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${safeStoreName}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280;">
                                Renewal Amount
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${safeAmount}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280;">
                                Invoice ID
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${safeInvoiceId}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280;">
                                Active Until
                              </td>
                              <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700;">
                                ${safeEndDate}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px; border:1px solid #f3e8ff; border-radius:20px; background:#fffaff;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <div style="font-size:15px; line-height:1.5; font-weight:700; color:#7d48c8;">
                            Subscription Status
                          </div>
                          <div style="margin-top:8px; font-size:14px; line-height:1.85; color:#4b5563;">
                            Your renewal has been completed successfully, and your subscription is now active through <strong>${safeEndDate}</strong>. No further action is required at this time.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
                      <tr>
                        <td align="left" style="padding:0 0 14px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" style="border-radius:14px; background:linear-gradient(135deg, #a56ee8 0%, #8e57d8 55%, #7d48c8 100%);">
                                <a href="${dashboardUrl}" style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:14px;">
                                  Open Dashboard
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                      <tr>
                        <td style="padding:0;">
                          <div style="font-size:14px; line-height:1.9; color:#6b7280;">
                            Thank you for continuing with us. We truly appreciate your partnership and look forward to supporting your business success.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 30px 30px; border-top:1px solid #f3e8ff; background:#fffcff;">
                    <div style="font-size:13px; line-height:1.9; color:#6b7280;">
                      Thank you,<br />
                      <span style="font-weight:700; color:#374151;">${brandName} Team</span>
                    </div>

                    <div style="margin-top:14px; font-size:12px; line-height:1.8; color:#9ca3af;">
                      This is an automated email confirming your subscription renewal.
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
Hi ${displayName},

Your subscription has been renewed successfully for ${safeStoreName}.

Renewal Overview:
- Store Name: ${safeStoreName}
- Renewal Amount: ${safeAmount}
- Invoice ID: ${safeInvoiceId}
- Active Until: ${safeEndDate}

Your renewal has been processed successfully, and your subscription remains active.

Open Dashboard:
${dashboardUrl}

Thank you for continuing with us.

${brandName} Team
  `.trim();

  // For testing only
  const to_email = "hardik.shoppiko@gmail.com";
  // const to_email = to;

  try {
    await sendHtml(to_email, subject, html, text);
  } catch (e) {
    console.log("Email failed", e);
  }
}

export async function sendSubscriptionUpdatedEmail({ to, name, affiliateId }) {
  const storeName = process.env.STORE_NAME || "Church Suits Business";
  
  const subject = `${storeName} - Your Subscription Has Been Updated`;

  const displayName = name ? String(name).trim() : "Valued Partner";
  const dashboardUrl = `${process.env.APP_URL}/account`;
  const billingUrl = `${process.env.APP_URL}/register/payment/${affiliateId}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f6f0ff; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(180deg, #f8f3ff 0%, #fffaff 100%); margin:0; padding:30px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; background:#ffffff; border:1px solid #eadcff; border-radius:24px; overflow:hidden; box-shadow:0 14px 35px rgba(125,72,200,0.10);">
                
                <tr>
                  <td style="background:linear-gradient(135deg, #a56ee8 0%, #8e57d8 55%, #7d48c8 100%); padding:32px 28px; text-align:center;">
                    <div style="font-size:13px; line-height:1; letter-spacing:1.5px; text-transform:uppercase; color:#f4eefe; font-weight:700;">
                      ${storeName}
                    </div>
                    <div style="margin-top:14px; font-size:30px; line-height:1.2; font-weight:700; color:#ffffff;">
                      Subscription Updated
                    </div>
                    <div style="margin-top:10px; font-size:15px; line-height:1.7; color:#efe7ff;">
                      Your subscription changes have been saved successfully.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 28px 18px;">
                    <div style="font-size:22px; line-height:1.3; font-weight:700; color:#111827;">
                      Hi ${displayName},
                    </div>

                    <div style="margin-top:14px; font-size:15px; line-height:1.8; color:#4b5563;">
                      This email confirms that your subscription has been updated successfully. Your account remains active, and the latest subscription details are now applied to your account.
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:22px; border:1px solid #eadcff; border-radius:18px; background:#fcf9ff;">
                      <tr>
                        <td style="padding:18px 18px;">
                          <div style="font-size:13px; line-height:1.5; font-weight:700; letter-spacing:0.03em; text-transform:uppercase; color:#7d48c8;">
                            Update Confirmation
                          </div>
                          <div style="margin-top:10px; font-size:14px; line-height:1.8; color:#4b5563;">
                            Your subscription preferences, plan details, or billing-related changes have been recorded successfully.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                      <tr>
                        <td style="padding:0 0 14px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" style="border-radius:14px; background:linear-gradient(135deg, #a56ee8 0%, #8e57d8 55%, #7d48c8 100%);">
                                <a href="${dashboardUrl}" style="display:inline-block; padding:14px 26px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:14px;">
                                  Open Dashboard
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px; border:1px solid #eadcff; border-radius:18px; background:#fffaff;">
                      <tr>
                        <td style="padding:18px 18px;">
                          <div style="font-size:15px; line-height:1.5; font-weight:700; color:#7d48c8;">
                            Need to review billing or plan details?
                          </div>
                          <div style="margin-top:8px; font-size:14px; line-height:1.8; color:#4b5563;">
                            You can review your account and billing-related information anytime from your payment page.
                          </div>
                          <div style="margin-top:12px;">
                            <a href="${billingUrl}" style="font-size:14px; font-weight:700; color:#7d48c8; text-decoration:none;">
                              View Billing Page
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                      <tr>
                        <td style="padding:0;">
                          <div style="font-size:14px; line-height:1.8; color:#6b7280;">
                            Thank you for keeping your subscription information up to date. We appreciate your continued partnership.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 28px 30px; border-top:1px solid #f3e8ff; background:#fffcff;">
                    <div style="font-size:13px; line-height:1.8; color:#6b7280;">
                      Thank you,<br />
                      <span style="font-weight:700; color:#374151;">${storeName} Team</span>
                    </div>

                    <div style="margin-top:14px; font-size:12px; line-height:1.8; color:#9ca3af;">
                      This is an automated email confirming your subscription update.
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
Hi ${displayName},

Your subscription was updated successfully.

You can access your dashboard here:
${dashboardUrl}

You can review billing or plan details here:
${billingUrl}

Thank you,
${storeName} Team
  `.trim();

  // let to_email = to;

  let to_email = 'hardik.shoppiko@gmail.com';

  try {
    await sendHtml(to_email, subject, html, text);
  } catch (e) {
    console.log("Email failed", e);
  }
}

/**
 * Forgot Password Email
 * - Matches your PHP language strings
 * - Mobile-friendly HTML
 * - Sends reset URL with code
 */
export async function sendForgotPasswordEmail({ to, name, storeName, resetUrl, ip }) {
  const subject = `${storeName || "Affiliate Program"} - Password reset request`;

  const displayName = name || "Affiliate";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f7f9;padding:26px;">
    <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e7e7e7;">
      <div style="background:#0f172a;color:#ffffff;padding:18px 22px;">
        <div style="font-size:18px;font-weight:700;margin:0;">Password reset request</div>
        <div style="font-size:13px;opacity:.9;margin-top:4px;">${storeName || "Affiliate Program"}</div>
      </div>

      <div style="padding:22px;color:#111827;">
        <p style="margin:0 0 12px 0;">Hello <strong>${displayName}</strong>,</p>

        <p style="margin:0 0 12px 0;">
          A new password was requested for <strong>${storeName || "your account"}</strong>.
        </p>

        <p style="margin:0 0 18px 0;">
          To reset your password, click the button below:
        </p>

        <div style="text-align:center;margin:22px 0;">
          <a href="${resetUrl}"
            style="
              display:inline-block;
              background:#000000;
              color:#ffffff;
              text-decoration:none;
              padding:12px 20px;
              border-radius:8px;
              font-weight:600;
              font-size:14px;
              line-height:1;
              border:1px solid #000000;
            "
          >
            Reset Password
          </a>
        </div>

        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:14px;">
          <div style="font-size:13px;color:#334155;margin-bottom:8px;font-weight:700;">Having trouble?</div>
          <div style="font-size:13px;color:#334155;word-break:break-all;">
            Copy and paste this link into your browser:<br/>
            <a href="${resetUrl}" style="color:#2563eb;text-decoration:underline;">${resetUrl}</a>
          </div>
        </div>

        <p style="margin:18px 0 0 0;font-size:12px;color:#64748b;">
          The IP used to make this request was: <strong>${ip || "N/A"}</strong>
        </p>

        <p style="margin:18px 0 0 0;font-size:12px;color:#64748b;">
          If you did not request a password reset, you can ignore this email.
        </p>

        <p style="margin:18px 0 0 0;">
          Thank you,<br/>
          <strong>${storeName || "Affiliate Program"} Team</strong>
        </p>
      </div>
    </div>
  </div>
  `;

  // console.log(html);

  const text = `
${storeName || "Affiliate Program"} - Password reset request

Hello ${displayName},

A new password was requested for ${storeName || "your account"}.

To reset your password click on the link below:
${resetUrl}

The IP used to make this request was: ${ip || "N/A"}

If you did not request a password reset, ignore this email.

Thanks,
${storeName || "Affiliate Program"} Team
  `.trim();

  try {
    // IMPORTANT: send to real recipient
    await sendHtml(`hardik.shoppiko@gmail.com`, subject, html, text);
  } catch (e) {
    console.log("Forgot password email failed", e);
  }
}