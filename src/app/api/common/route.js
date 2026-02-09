import { NextResponse } from "next/server";
import { sendHtml } from "@/lib/sendgrid-email";

// IMPORTANT for SendGrid
export const runtime = "nodejs";

export async function GET() {
  try {
    const testEmail = process.env.SENDGRID_FROM_EMAIL;

    if (!testEmail) {
      return NextResponse.json(
        { success: false, message: "No test email configured." },
        { status: 400 }
      );
    }

    await sendHtml(
      testEmail,
      "SendGrid Test Email",
      `
        <h2>✅ SendGrid Test Successful</h2>
        <p>Your SendGrid email setup is working correctly.</p>
        <p><b>Environment:</b> Local Dev</p>
        <p><b>Time:</b> ${new Date().toISOString()}</p>
      `,
      "SendGrid test email successful."
    );

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully.",
      to: testEmail,
    });
  } catch (err) {
    console.error("SendGrid error status:", err?.code);
    console.error("SendGrid error body:", err?.response?.body);
    return NextResponse.json(
      {
        success: false,
        message: "Email failed",
        status: err?.code || 500,
        error: err?.response?.body || err.message,
      },
      { status: 500 }
    );
  }
}