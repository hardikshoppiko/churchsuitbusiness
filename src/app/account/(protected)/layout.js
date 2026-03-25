import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }) {
  const session = await getSession();

  console.log(session);

  if (!session) {
    redirect("/account/login");
  }
  
  return children;
}