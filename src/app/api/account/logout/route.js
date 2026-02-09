import { clearSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearSession();

    return Response.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (e) {
    return Response.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}