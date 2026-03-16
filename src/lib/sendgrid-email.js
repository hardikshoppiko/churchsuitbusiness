export const runtime = "nodejs";

import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;
const fromName = process.env.SENDGRID_FROM_NAME || "Support";

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

function normalizeRecipients(value) {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    const cleaned = value
      .map((v) => String(v || "").trim())
      .filter(Boolean);

    return cleaned.length ? cleaned : undefined;
  }

  const cleaned = String(value).trim();
  return cleaned ? cleaned : undefined;
}

function buildMessage({
  to,
  subject,
  text,
  html,
  cc,
  bcc,
}) {
  const msg = {
    to: normalizeRecipients(to),
    from: { email: fromEmail, name: fromName },
    subject: String(subject || ""),
  };

  const normalizedCc = normalizeRecipients(cc);
  const normalizedBcc = normalizeRecipients(bcc);

  if (normalizedCc) {
    msg.cc = normalizedCc;
  }

  if (normalizedBcc) {
    msg.bcc = normalizedBcc;
  }

  if (typeof text !== "undefined") {
    msg.text = String(text || "");
  }

  if (typeof html !== "undefined") {
    msg.html = String(html || "");
  }

  return msg;
}

/**
 * Send plain text email
 */
export async function sendText(to, subject, text, options = {}) {
  assertReady();

  const msg = buildMessage({
    to,
    subject,
    text,
    cc: options.cc,
    bcc: options.bcc,
  });

  await sgMail.send(msg);
}

/**
 * Send HTML email (with optional text fallback)
 */
export async function sendHtml(to, subject, html, textFallback = "", options = {}) {
  assertReady();

  const msg = buildMessage({
    to,
    subject,
    html,
    text: textFallback,
    cc: options.cc,
    bcc: options.bcc,
  });

  try {
    await sgMail.send(msg);
  } catch (err) {
    console.log("SendGrid Error status:", err?.code || err?.response?.statusCode);
    console.log("SendGrid Error body:", err?.response?.body);
    console.log("SendGrid Error headers:", err?.response?.headers);
    throw err;
  }
}