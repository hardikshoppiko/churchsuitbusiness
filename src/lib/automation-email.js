// src/lib/automation-email.js
import { sendHtml } from "@/lib/sendgrid-email";

const BCC_EMAILS = [];

/**
 * OPTIONAL FOOTER CONTROLS
 */
const SHOW_EMAIL_UNSUBSCRIBE_LINK = true;
const SHOW_SMS_UNSUBSCRIBE_TEXT = false;

const AUTOMATION_EMAIL_THEME = {
  brandName: process.env.STORE_NAME || "Church Suits Business",
  outerBg: "linear-gradient(180deg, #f8f3ff 0%, #fffaff 100%)",
  cardBg: "#ffffff",
  cardBorder: "#eadcff",
  summaryBg: "#fcf9ff",
  footerBg: "#fffcff",

  variants: {
    default: {
      headerGradient: "linear-gradient(135deg, #8e57d8 0%, #7d48c8 55%, #6d38bb 100%)",
      buttonGradient: "linear-gradient(135deg, #a56ee8 0%, #8e57d8 55%, #7d48c8 100%)",
      accent: "#7d48c8",
      accentSoft: "#f3e8ff",
      highlightBorder: "#f3e8ff",
      highlightBg: "#fffaff",
      highlightTitle: "#7d48c8",
    },
    success: {
      headerGradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 55%, #6d28d9 100%)",
      buttonGradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 55%, #6d28d9 100%)",
      accent: "#7d48c8",
      accentSoft: "#ede9fe",
      highlightBorder: "#e9d5ff",
      highlightBg: "#faf5ff",
      highlightTitle: "#7d48c8",
    },
    warning: {
      headerGradient: "linear-gradient(135deg, #b45309 0%, #d97706 55%, #f59e0b 100%)",
      buttonGradient: "linear-gradient(135deg, #b45309 0%, #d97706 55%, #f59e0b 100%)",
      accent: "#b45309",
      accentSoft: "#ffedd5",
      highlightBorder: "#fed7aa",
      highlightBg: "#fff7ed",
      highlightTitle: "#b45309",
    },
    danger: {
      headerGradient: "linear-gradient(135deg, #be123c 0%, #e11d48 55%, #f43f5e 100%)",
      buttonGradient: "linear-gradient(135deg, #be123c 0%, #e11d48 55%, #f43f5e 100%)",
      accent: "#be123c",
      accentSoft: "#ffe4e6",
      highlightBorder: "#fecdd3",
      highlightBg: "#fff1f2",
      highlightTitle: "#be123c",
    },
    info: {
      headerGradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #60a5fa 100%)",
      buttonGradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #60a5fa 100%)",
      accent: "#2563eb",
      accentSoft: "#dbeafe",
      highlightBorder: "#bfdbfe",
      highlightBg: "#eff6ff",
      highlightTitle: "#2563eb",
    },
  },
};

function getVariantTheme(variant = "default") {
  return (
    AUTOMATION_EMAIL_THEME.variants[String(variant || "default")] ||
    AUTOMATION_EMAIL_THEME.variants.default
  );
}

function normalizeText(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nl2br(value) {
  return String(value || "").replace(/\n/g, "<br />");
}

function toHtmlParagraphs(value) {
  const safe = escapeHtml(value || "");
  return safe
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map(
      (chunk) =>
        `<div style="margin-top:14px; font-size:15px; line-height:1.9; color:#4b5563;">${nl2br(chunk)}</div>`
    )
    .join("");
}

function renderHeader({ brandName, title, subtitle, theme }) {
  return `
    <tr>
      <td style="background:${theme.headerGradient}; padding:36px 30px; text-align:center;">
        <div style="font-size:13px; line-height:1; letter-spacing:1.6px; text-transform:uppercase; color:#f4eefe; font-weight:700;">
          ${escapeHtml(brandName)}
        </div>

        <div style="margin-top:14px; font-size:32px; line-height:1.2; font-weight:700; color:#ffffff;">
          ${escapeHtml(title)}
        </div>

        ${
          subtitle
            ? `<div style="margin-top:10px; font-size:15px; line-height:1.85; color:#efe7ff;">${nl2br(
                escapeHtml(subtitle)
              )}</div>`
            : ""
        }
      </td>
    </tr>
  `;
}

function renderSummaryRows(rows = [], theme) {
  const safeRows = Array.isArray(rows) ? rows.filter(Boolean) : [];
  if (!safeRows.length) return "";

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px; border:1px solid ${AUTOMATION_EMAIL_THEME.cardBorder}; border-radius:22px; background:${AUTOMATION_EMAIL_THEME.summaryBg};">
      <tr>
        <td style="padding:22px 22px;">
          <div style="font-size:13px; line-height:1.4; font-weight:700; letter-spacing:0.03em; text-transform:uppercase; color:${theme.accent};">
            Quick Details
          </div>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:14px;">
            ${safeRows
              .map(
                (row) => `
                  <tr>
                    <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#6b7280; width:170px; vertical-align:top;">
                      ${escapeHtml(row.label || "")}
                    </td>
                    <td style="padding:8px 0; font-size:14px; line-height:1.75; color:#111827; font-weight:700; vertical-align:top; word-break:break-word;">
                      ${row.isHtml ? String(row.value || "") : escapeHtml(row.value || "")}
                    </td>
                  </tr>
                `
              )
              .join("")}
          </table>
        </td>
      </tr>
    </table>
  `;
}

function renderHighlightBox({ title = "", text = "" }, theme) {
  const safeTitle = normalizeText(title);
  const safeText = normalizeText(text);

  if (!safeTitle && !safeText) return "";

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px; border:1px solid ${theme.highlightBorder}; border-radius:20px; background:${theme.highlightBg};">
      <tr>
        <td style="padding:18px 20px;">
          ${
            safeTitle
              ? `<div style="font-size:15px; line-height:1.5; font-weight:700; color:${theme.highlightTitle};">${escapeHtml(
                  safeTitle
                )}</div>`
              : ""
          }
          ${
            safeText
              ? `<div style="margin-top:8px; font-size:14px; line-height:1.85; color:#4b5563;">${nl2br(
                  escapeHtml(safeText)
                )}</div>`
              : ""
          }
        </td>
      </tr>
    </table>
  `;
}

function renderButton({ label = "", url = "" }, theme) {
  const safeLabel = normalizeText(label);
  const safeUrl = normalizeText(url);

  if (!safeLabel || !safeUrl) return "";

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
      <tr>
        <td align="left" style="padding:0 0 14px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" style="border-radius:14px; background:${theme.buttonGradient};">
                <a href="${safeUrl}" style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:14px;">
                  ${escapeHtml(safeLabel)}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function renderFooterExtras({
  showEmailUnsubscribe = SHOW_EMAIL_UNSUBSCRIBE_LINK,
  unsubscribeEmailUrl = "",
  showSmsUnsubscribe = SHOW_SMS_UNSUBSCRIBE_TEXT,
  smsUnsubscribeText = "",
}) {
  const parts = [];

  if (showEmailUnsubscribe && unsubscribeEmailUrl) {
    parts.push(`
      <div style="margin-top:12px; font-size:12px; line-height:1.8; color:#9ca3af;">
        Don’t want these emails?
        <a href="${unsubscribeEmailUrl}" style="color:#7d48c8; text-decoration:none; font-weight:700;">
          Unsubscribe from email notifications
        </a>
      </div>
    `);
  }

  if (showSmsUnsubscribe && smsUnsubscribeText) {
    parts.push(`
      <div style="margin-top:8px; font-size:12px; line-height:1.8; color:#9ca3af;">
        ${escapeHtml(smsUnsubscribeText)}
      </div>
    `);
  }

  return parts.join("");
}

function buildCronAutomationEmailHtml({
  subject,
  variant = "default",
  title,
  subtitle,
  greeting,
  intro,
  body,
  summaryRows = [],
  highlightTitle = "",
  highlightText = "",
  ctaLabel = "",
  ctaUrl = "",
  closingText = "",
  footerNote = "",
  showEmailUnsubscribe = SHOW_EMAIL_UNSUBSCRIBE_LINK,
  unsubscribeEmailUrl = "",
  showSmsUnsubscribe = SHOW_SMS_UNSUBSCRIBE_TEXT,
  smsUnsubscribeText = "",
}) {
  const brandName = AUTOMATION_EMAIL_THEME.brandName;
  const theme = getVariantTheme(variant);

  const safeSubject = normalizeText(subject);
  const safeTitle = normalizeText(title) || "Important Account Update";
  const safeSubtitle = normalizeText(subtitle);
  const safeGreeting = normalizeText(greeting) || "Hello,";
  const safeIntro = normalizeText(intro);
  const safeBody = normalizeText(body);
  const safeClosingText =
    normalizeText(closingText) ||
    `Thank you for your continued interest in ${brandName}.`;
  const safeFooterNote =
    normalizeText(footerNote) ||
    "This is an automated notification. Please do not reply directly to this email.";

  const introHtml = safeIntro
    ? `<div style="margin-top:14px; font-size:15px; line-height:1.9; color:#4b5563;">${nl2br(
        escapeHtml(safeIntro)
      )}</div>`
    : "";

  const bodyHtml = safeBody ? toHtmlParagraphs(safeBody) : "";
  const footerExtrasHtml = renderFooterExtras({
    showEmailUnsubscribe,
    unsubscribeEmailUrl,
    showSmsUnsubscribe,
    smsUnsubscribeText,
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(safeSubject)}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f6f0ff; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background:${AUTOMATION_EMAIL_THEME.outerBg}; margin:0; padding:30px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px; background:${AUTOMATION_EMAIL_THEME.cardBg}; border:1px solid ${AUTOMATION_EMAIL_THEME.cardBorder}; border-radius:28px; overflow:hidden; box-shadow:0 20px 50px rgba(125,72,200,0.12);">
                ${renderHeader({
                  brandName,
                  title: safeTitle,
                  subtitle: safeSubtitle,
                  theme,
                })}

                <tr>
                  <td style="padding:34px 30px 18px;">
                    <div style="font-size:24px; line-height:1.3; font-weight:700; color:#111827;">
                      ${escapeHtml(safeGreeting)}
                    </div>

                    ${introHtml}
                    ${bodyHtml}
                    ${renderSummaryRows(summaryRows, theme)}
                    ${renderHighlightBox({ title: highlightTitle, text: highlightText }, theme)}
                    ${renderButton({ label: ctaLabel, url: ctaUrl }, theme)}

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                      <tr>
                        <td style="padding:0;">
                          <div style="font-size:14px; line-height:1.9; color:#6b7280;">
                            ${escapeHtml(safeClosingText)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 30px 30px; border-top:1px solid ${theme.accentSoft}; background:${AUTOMATION_EMAIL_THEME.footerBg};">
                    <div style="font-size:13px; line-height:1.9; color:#6b7280;">
                      Regards,<br />
                      <span style="font-weight:700; color:#374151;">${escapeHtml(brandName)} Team</span>
                    </div>

                    <div style="margin-top:14px; font-size:12px; line-height:1.8; color:#9ca3af;">
                      ${escapeHtml(safeFooterNote)}
                    </div>

                    ${footerExtrasHtml}
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildCronAutomationEmailText({
  greeting,
  intro,
  body,
  summaryRows = [],
  highlightTitle = "",
  highlightText = "",
  ctaLabel = "",
  ctaUrl = "",
  closingText = "",
  footerNote = "",
  showEmailUnsubscribe = SHOW_EMAIL_UNSUBSCRIBE_LINK,
  unsubscribeEmailUrl = "",
  showSmsUnsubscribe = SHOW_SMS_UNSUBSCRIBE_TEXT,
  smsUnsubscribeText = "",
}) {
  const lines = [];

  if (greeting) lines.push(String(greeting).trim(), "");
  if (intro) lines.push(String(intro).trim(), "");
  if (body) lines.push(String(body).trim(), "");

  if (Array.isArray(summaryRows) && summaryRows.length) {
    lines.push("Quick Details:");
    for (const row of summaryRows) {
      lines.push(`- ${row.label}: ${row.textValue || row.value || ""}`);
    }
    lines.push("");
  }

  if (highlightTitle || highlightText) {
    if (highlightTitle) lines.push(String(highlightTitle).trim());
    if (highlightText) lines.push(String(highlightText).trim());
    lines.push("");
  }

  if (ctaLabel && ctaUrl) {
    lines.push(`${ctaLabel}:`, String(ctaUrl).trim(), "");
  }

  if (closingText) {
    lines.push(String(closingText).trim(), "");
  }

  lines.push("Regards,", `${AUTOMATION_EMAIL_THEME.brandName} Team`);

  if (footerNote) {
    lines.push("", String(footerNote).trim());
  }

  if (showEmailUnsubscribe && unsubscribeEmailUrl) {
    lines.push("", `Unsubscribe from email notifications: ${String(unsubscribeEmailUrl).trim()}`);
  }

  if (showSmsUnsubscribe && smsUnsubscribeText) {
    lines.push("", String(smsUnsubscribeText).trim());
  }

  return lines.join("\n").trim();
}

export async function sendCronAutomationEmail({
  to,
  subject,
  variant = "default",
  title,
  subtitle,
  greeting,
  intro,
  body,
  summaryRows = [],
  highlightTitle = "",
  highlightText = "",
  ctaLabel = "",
  ctaUrl = "",
  closingText = "",
  footerNote = "",
  showEmailUnsubscribe = SHOW_EMAIL_UNSUBSCRIBE_LINK,
  unsubscribeEmailUrl = "",
  showSmsUnsubscribe = SHOW_SMS_UNSUBSCRIBE_TEXT,
  smsUnsubscribeText = "",
  bcc = BCC_EMAILS,
}) {
  const to_email = String(to || "").trim();

  if (!to_email) {
    return null;
  }

  const html = buildCronAutomationEmailHtml({
    subject,
    variant,
    title,
    subtitle,
    greeting,
    intro,
    body,
    summaryRows,
    highlightTitle,
    highlightText,
    ctaLabel,
    ctaUrl,
    closingText,
    footerNote,
    showEmailUnsubscribe,
    unsubscribeEmailUrl,
    showSmsUnsubscribe,
    smsUnsubscribeText,
  });

  const text = buildCronAutomationEmailText({
    greeting,
    intro,
    body,
    summaryRows,
    highlightTitle,
    highlightText,
    ctaLabel,
    ctaUrl,
    closingText,
    footerNote,
    showEmailUnsubscribe,
    unsubscribeEmailUrl,
    showSmsUnsubscribe,
    smsUnsubscribeText,
  });

  try {
    await sendHtml(to_email, subject, html, text, { bcc });
  } catch (e) {
    console.log("Cron automation email failed", e);
    return null;
  }

  return {
    ok: true,
    to: to_email,
    subject,
  };
}

export async function sendLeadEmail({
  to,
  subject,
  body,
  firstname = "",
  lastname = "",
  email = "",
  telephone = "",
  source_url = "",
  register_url = "",
  payment_url = "",
  affiliate_id = "",
}) {
  const unsubscribeEmailUrl = email
    ? `${process.env.APP_URL}/unsubscribe/email?email=${encodeURIComponent(email)}`
    : "";

  const displayName = `${firstname || ""} ${lastname || ""}`.trim();

  return await sendCronAutomationEmail({
    to,
    subject,
    variant: "success",
    title: "Affiliate Program Update",
    subtitle: "Thank you for your interest in our affiliate website program.",
    greeting: displayName ? `Hello ${displayName},` : "Hello,",
    intro:
      "We’re sharing an important update based on your interest in our affiliate website program.",
    body,
    summaryRows: [
      ...(affiliate_id
        ? [{ label: "Affiliate ID", value: affiliate_id, textValue: affiliate_id }]
        : []),
      ...(email ? [{ label: "Email", value: email, textValue: email }] : []),
      ...(telephone ? [{ label: "Mobile", value: telephone, textValue: telephone }] : []),
      ...(source_url ? [{ label: "Source URL", value: source_url, textValue: source_url }] : []),
      ...(register_url
        ? [{ label: "Register Page", value: register_url, textValue: register_url }]
        : []),
    ],
    highlightTitle: "Get Started",
    highlightText:
      "Complete your registration to explore your affiliate website opportunity and continue your setup steps.",
    ctaLabel: register_url ? "Start Registration" : "",
    ctaUrl: register_url || "",
    footerNote:
      "This is an automated affiliate program email. Please do not reply directly to this message.",
    closingText: payment_url
      ? "If you have already started your signup, you can also continue from your payment page."
      : "We’d be happy to welcome you to our affiliate website program.",
    showEmailUnsubscribe: true,
    unsubscribeEmailUrl,
    showSmsUnsubscribe: false,
    smsUnsubscribeText: "SMS unsubscribe options will be available soon.",
  });
}

export async function sendPendingPaymentEmail({
  to,
  subject,
  body,
  firstname = "",
  lastname = "",
  email = "",
  telephone = "",
  affiliate_id = "",
  payment_url = "",
}) {
  const unsubscribeEmailUrl = email
    ? `${process.env.APP_URL}/unsubscribe/email?email=${encodeURIComponent(email)}`
    : "";

  return await sendCronAutomationEmail({
    to,
    subject,
    variant: "warning",
    title: "Payment Reminder",
    subtitle: "Your affiliate account has a pending payment update.",
    greeting: `Hello ${firstname || lastname || "Partner"},`,
    intro:
      "Please review the information below and complete your pending payment step to continue smoothly.",
    body,
    summaryRows: [
      ...(affiliate_id
        ? [{ label: "Affiliate ID", value: affiliate_id, textValue: affiliate_id }]
        : []),
      ...(email ? [{ label: "Email", value: email, textValue: email }] : []),
      ...(telephone ? [{ label: "Telephone", value: telephone, textValue: telephone }] : []),
    ],
    highlightTitle: "Action Required",
    highlightText:
      "Please complete your payment as soon as possible to avoid interruption in your affiliate setup.",
    ctaLabel: payment_url ? "Open Payment Page" : "",
    ctaUrl: payment_url || "",
    footerNote:
      "This is an automated payment reminder. Please do not reply directly to this email.",
    closingText:
      "We appreciate your time and look forward to helping you continue your setup.",
    showEmailUnsubscribe: true,
    unsubscribeEmailUrl,
    showSmsUnsubscribe: false,
    smsUnsubscribeText: "SMS unsubscribe options will be available soon.",
  });
}