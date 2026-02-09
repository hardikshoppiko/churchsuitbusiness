import { clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function GET() {
  clearSession();
  redirect("/account/login");
}