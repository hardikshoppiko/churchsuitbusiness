// src/lib/email.js
import { sendHtml } from "@/lib/sendgrid-email";

export async function sendPaymentFailedEmail({ to, name, invoiceId, affiliateId }) {
  const storeName = process.env.STORE_NAME || "Church Suits Business";

  const subject = `${storeName} - Payment Failed — Action Required`;

  const displayName = name ? String(name).trim() : "Valued Partner";
  const safeInvoiceId = invoiceId || "N/A";
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
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(180deg, #f8f3ff 0%, #fffaff 100%); margin:0; padding:30px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; background:#ffffff; border:1px solid #eadcff; border-radius:24px; overflow:hidden; box-shadow:0 14px 35px rgba(125,72,200,0.10);">
                
                <tr>
                  <td style="background:linear-gradient(135deg, #8e57d8 0%, #7d48c8 55%, #6d38bb 100%); padding:32px 28px; text-align:center;">
                    <div style="font-size:13px; line-height:1; letter-spacing:1.5px; text-transform:uppercase; color:#f4eefe; font-weight:700;">
                      ${storeName}
                    </div>
                    <div style="margin-top:14px; font-size:30px; line-height:1.2; font-weight:700; color:#ffffff;">
                      Payment Failed
                    </div>
                    <div style="margin-top:10px; font-size:15px; line-height:1.7; color:#efe7ff;">
                      Please update your payment method to keep your account active.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 28px 18px;">
                    <div style="font-size:22px; line-height:1.3; font-weight:700; color:#111827;">
                      Hello, ${displayName}
                    </div>

                    <div style="margin-top:14px; font-size:15px; line-height:1.8; color:#4b5563;">
                      We were unable to process your recent subscription payment. To avoid any interruption to your store and services, please review and update your payment method as soon as possible.
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:22px; border:1px solid #eadcff; border-radius:18px; background:#fcf9ff;">
                      <tr>
                        <td style="padding:18px 18px;">
                          <div style="font-size:13px; line-height:1.5; font-weight:700; letter-spacing:0.03em; text-transform:uppercase; color:#7d48c8;">
                            Payment Details
                          </div>
                          <div style="margin-top:10px; font-size:15px; line-height:1.7; color:#374151;">
                            <strong>Invoice ID:</strong> ${safeInvoiceId}
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
                                <a href="${paymentUrl}" style="display:inline-block; padding:14px 26px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:14px;">
                                  Update Payment Method
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px; border:1px solid #f5d0fe; border-radius:18px; background:#fff7fb;">
                      <tr>
                        <td style="padding:18px 18px;">
                          <div style="font-size:15px; line-height:1.5; font-weight:700; color:#a21caf;">
                            Important Reminder
                          </div>
                          <div style="margin-top:8px; font-size:14px; line-height:1.8; color:#4b5563;">
                            If this issue is not resolved promptly, your store access or subscription-related services may be affected.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                      <tr>
                        <td style="padding:0;">
                          <div style="font-size:14px; line-height:1.8; color:#6b7280;">
                            If you believe this message was sent in error, or if you need any help, please contact our support team.
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
Hello ${displayName},

We were unable to process your recent subscription payment.

Invoice ID: ${safeInvoiceId}

To avoid interruption to your store and services, please update your payment method here:
${paymentUrl}

If you believe this message was sent in error, or if you need help, please contact our support team.

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

export async function sendSubscriptionActivatedEmail({ to, name, affiliateId }) {
  const storeName = process.env.STORE_NAME || "Church Suits Business";

  const subject = `Welcome to ${storeName} - Your Subscription Is Active!`;

  const dashboardUrl = `${process.env.APP_URL}/account`;
  const paymentUrl = `${process.env.APP_URL}/register/payment/${affiliateId}`;
  const safeName = name ? String(name).trim() : "Valued Partner";

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
                      Subscription Activated
                    </div>
                    <div style="margin-top:10px; font-size:15px; line-height:1.7; color:#efe7ff;">
                      Your account is now active and ready to use.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 28px 18px;">
                    <div style="font-size:22px; line-height:1.3; font-weight:700; color:#111827;">
                      Welcome, ${safeName}!
                    </div>

                    <div style="margin-top:14px; font-size:15px; line-height:1.8; color:#4b5563;">
                      We are happy to let you know that your subscription has been successfully activated.
                      Your store is now active, and you can start managing your account from your dashboard.
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                      <tr>
                        <td style="padding:0 0 14px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" style="border-radius:14px; background:linear-gradient(135deg, #a56ee8 0%, #8e57d8 55%, #7d48c8 100%);">
                                <a href="${dashboardUrl}" style="display:inline-block; padding:14px 26px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:14px;">
                                  Go to Dashboard
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px; border:1px solid #eadcff; border-radius:18px; background:#fcf9ff;">
                      <tr>
                        <td style="padding:18px 18px;">
                          <div style="font-size:15px; line-height:1.5; font-weight:700; color:#7d48c8;">
                            Need to review payment details?
                          </div>
                          <div style="margin-top:8px; font-size:14px; line-height:1.8; color:#4b5563;">
                            If you still need to complete or review any payment-related step, you can use the secure payment page below.
                          </div>
                          <div style="margin-top:12px;">
                            <a href="${paymentUrl}" style="font-size:14px; font-weight:700; color:#7d48c8; text-decoration:none;">
                              Complete Payment
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                      <tr>
                        <td style="padding:0;">
                          <div style="font-size:14px; line-height:1.8; color:#6b7280;">
                            You can now log in, manage your account, and continue setting up your business tools from your dashboard.
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

We are happy to let you know that your subscription has been successfully activated.

Your store is now active, and you can start managing your account from your dashboard.

Go to Dashboard:
${dashboardUrl}

Need to review payment details?
If you still need to complete or review any payment-related step, you can use the secure payment page below.

Complete Payment:
${paymentUrl}

You can now log in, manage your account, and continue setting up your business tools from your dashboard.

Thank you,
${storeName} Team

This is an automated message confirming your subscription activation.
  `.trim();

  // let to_email = to;

  let to_email = 'hardik.shoppiko@gmail.com';

  try {
    await sendHtml(to_email, subject, html, text);
  } catch (e) {
    console.log("Email failed", e);
  }
}

export async function sendSubscriptionRenewedEmail({ to, name, affiliateId, amount, invoiceId }) {
  const storeName = process.env.STORE_NAME || "Church Suits Business";

  const subject = `${storeName} - Subscription Renewed Successfully`;

  const displayName = name ? String(name).trim() : "Valued Partner";
  const safeAmount = Number(amount || 0).toFixed(2);
  const safeInvoiceId = invoiceId || "N/A";
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
                      Subscription Renewed
                    </div>
                    <div style="margin-top:10px; font-size:15px; line-height:1.7; color:#efe7ff;">
                      Your renewal payment was processed successfully.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 28px 18px;">
                    <div style="font-size:22px; line-height:1.3; font-weight:700; color:#111827;">
                      Hi ${displayName},
                    </div>

                    <div style="margin-top:14px; font-size:15px; line-height:1.8; color:#4b5563;">
                      Great news — your monthly subscription has been renewed successfully. Your account and services remain active without interruption.
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:22px; border:1px solid #eadcff; border-radius:18px; background:#fcf9ff;">
                      <tr>
                        <td style="padding:18px 18px;">
                          <div style="font-size:13px; line-height:1.5; font-weight:700; letter-spacing:0.03em; text-transform:uppercase; color:#7d48c8;">
                            Renewal Details
                          </div>

                          <div style="margin-top:10px; font-size:15px; line-height:1.8; color:#374151;">
                            <strong>Amount:</strong> $${safeAmount}
                          </div>

                          <div style="margin-top:4px; font-size:15px; line-height:1.8; color:#374151;">
                            <strong>Invoice ID:</strong> ${safeInvoiceId}
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
                            Need to review billing?
                          </div>
                          <div style="margin-top:8px; font-size:14px; line-height:1.8; color:#4b5563;">
                            You can review your account or billing-related steps anytime from your payment page.
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
                            Thank you for continuing with us. We appreciate your partnership and support.
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

Your monthly subscription renewal was successful.

Amount: $${safeAmount}
Invoice ID: ${safeInvoiceId}

Open Dashboard:
${dashboardUrl}

Billing Page:
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