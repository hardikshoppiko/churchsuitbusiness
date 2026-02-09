import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ success: false, loggedIn: false }, { status: 200 });
  }

  return Response.json({
    success: true,
    loggedIn: true,
    user: session,
  });
}