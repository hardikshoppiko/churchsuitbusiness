// src/lib/email.js
import { sendHtml } from "@/lib/sendgrid-email";

export async function sendPaymentFailedEmail({ to, name, invoiceId, affiliateId }) {
  const subject = "Payment Failed - Action Required";

  const displayName = name || "Affiliate";

  const paymentUrl = `${process.env.APP_URL}/register/payment/${affiliateId}`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; background:#f6f7f9; padding:30px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:6px; overflow:hidden;">
        
        <div style="background:#0f172a; color:#ffffff; padding:16px 24px;">
          <h2 style="margin:0; font-size:20px;">Payment Failed</h2>
        </div>

        <div style="padding:24px; color:#333;">
          <p style="margin-top:0;">Hello <strong>${displayName}</strong>,</p>

          <p>
            Unfortunately, we were unable to process your recent subscription payment.
          </p>

          <p>
            <strong>Invoice ID:</strong> ${invoiceId || "N/A"}
          </p>

          <p>
            To avoid interruption of your store and services, please update your payment details as soon as possible.
          </p>

          <div style="margin:30px 0; text-align:center;">
            <a href="${paymentUrl}"
              style="background:#c9a14a; color:#111; padding:12px 22px;
                     text-decoration:none; border-radius:4px; font-weight:bold;">
              Update Payment Method
            </a>
          </div>

          <p style="font-size:14px; color:#555;">
            If you believe this message was sent in error, or if you need assistance, please contact our support team.
          </p>

          <p style="margin-bottom:0;">
            Thank you,<br />
            <strong>${process.env.STORE_NAME} Team</strong>
          </p>
        </div>

      </div>
    </div>
  `;

  const text = `
Hello ${displayName},

Your recent subscription payment could not be processed.

Invoice ID: ${invoiceId || "N/A"}

Please update your payment details to avoid service interruption:
${paymentUrl}

Thank you,
We Ship Fashions Support Team
  `;
  try {
    await sendHtml('hardik.shoppiko@gmail.com', subject, html, text);
  } catch(e) { 
    console.log("Email failed", e); 
  }
}

export async function sendSubscriptionActivatedEmail({ to, name, affiliateId }) {
  const subject = "Your subscription is active — welcome!";
  const html = `
    <h2>Welcome ${name || ""}!</h2>
    <p>Your subscription is now active and your store has been activated.</p>
    <p><a href="${process.env.APP_URL}/dashboard">Go to Dashboard</a></p>
    <p>If you still need to complete anything, you can also pay here:</p>
    <p><a href="${process.env.APP_URL}/register/payment/${affiliateId}">Complete Payment</a></p>
  `;
  
  try {
    await sendHtml('hardik.shoppiko@gmail.com', subject, html, "Your subscription is active.");
  } catch(e) { 
    console.log("Email failed", e); 
  }
}

export async function sendSubscriptionRenewedEmail({ to, name, affiliateId, amount, invoiceId }) {
  const subject = "Subscription renewed successfully";
  const html = `
    <h2>Hi ${name || ""},</h2>
    <p>Your monthly subscription renewal was successful.</p>
    <p><b>Amount:</b> $${Number(amount || 0).toFixed(2)}</p>
    <p><b>Invoice:</b> ${invoiceId || ""}</p>
    <p><a href="${process.env.APP_URL}/dashboard">Open Dashboard</a></p>
  `;

  try {
    await sendHtml('hardik.shoppiko@gmail.com', subject, html, "Subscription renewed successfully.");
  } catch(e) { 
    console.log("Email failed", e); 
  }  
}

export async function sendSubscriptionUpdatedEmail({ to, name, affiliateId }) {
  const subject = "Your subscription was updated";
  const html = `
    <h2>Hi ${name || ""},</h2>
    <p>Your subscription was updated successfully.</p>
    <p><a href="${process.env.APP_URL}/dashboard">Open Dashboard</a></p>
  `;
  
  try {
    await sendHtml('hardik.shoppiko@gmail.com', subject, html, "Your subscription was updated.");
  } catch(e) { 
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