export const runtime = "nodejs";

import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;
const fromName = process.env.SENDGRID_FROM_NAME || "Support";

// console.log("SendGrid apiKey:", apiKey);
// console.log("SendGrid fromEmail:", fromEmail);
// console.log("SendGrid fromName:", fromName);

if (!apiKey) {
  const message = "⚠️ SENDGRID_API_KEY is missing";
  console.warn(message);
  console.log(message);
} else {
  sgMail.setApiKey(apiKey);
}

function assertReady() {
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is missing");
  }

  if (!fromEmail) {
    throw new Error("SENDGRID_FROM_EMAIL is missing");
  }
}

function normalizeTo(to) {
  if (Array.isArray(to)) {
    return to.filter(Boolean);
  }
  
  return String(to || "").trim();
}

/**
 * Send plain text email
 */
export async function sendText(to, subject, text) {
  assertReady();

  await sgMail.send({
    to: normalizeTo(to),
    from: { email: fromEmail, name: fromName },
    subject: String(subject || ""),
    text: String(text || ""),
  });
}

/**
 * Send HTML email (with optional text fallback)
 */
export async function sendHtml(to, subject, html, textFallback = "") {
  assertReady();

  try {
    await sgMail.send({
      to: normalizeTo(to),
      from: { email: fromEmail, name: fromName },
      subject: String(subject || ""),
      html: String(html || ""),
      text: String(textFallback || ""),
    });
  } catch (err) {
    console.log("SendGrid Error status:", err?.code || err?.response?.statusCode);
    console.log("SendGrid Error body:", err?.response?.body);
    console.log("SendGrid Error headers:", err?.response?.headers);
    throw err;
  }
}