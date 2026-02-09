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