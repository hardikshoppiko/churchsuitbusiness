import { headers } from "next/headers";

import ProfileForm from "./ProfileForm";

export const metadata = {
  title: `My Profile | ${process.env.STORE_NAME} Affiliate Program`,
  description: `Update your ${process.env.STORE_NAME} affiliate profile details.`,
};

async function fetchProfile() {
  const h = await headers();

  const cookieHeader = h.get("cookie") || "";

  const res = await fetch(`${process.env.APP_URL}/api/affiliate/profile`, {
    method: "GET",
    cache: "no-store",
    headers: { cookie: cookieHeader }
  });

  const data = await res.json().catch(() => ({}));
  return data;
}

export default async function ProfilePage() {
  const data = await fetchProfile();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your basic details and password.
        </p>
      </div>

      <ProfileForm initialData={data} />
    </div>
  );
}