import { getSession } from "@/lib/auth";

export default async function AccountHome() {
  const session = await getSession();

  // console.log("Session in AccountHome:", session);

  return (
    <div className={`container py-4`}>
      <h3>My Account</h3>
      <div className="mt-2">
        Welcome, <b>{session?.firstname}</b>
      </div>
    </div>
  );
}