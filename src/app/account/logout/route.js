import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearSession();

    return NextResponse.json({
      ok: true,
      message: "Logged out successfully",
    });
  } catch (e) {
    console.error("Logout failed:", e);

    return NextResponse.json(
      {
        ok: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}