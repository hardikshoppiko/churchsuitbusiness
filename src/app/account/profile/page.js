import { headers } from "next/headers";

import ProfileForm from "./ProfileForm";
import styles from "./page.module.css";

export const metadata = {
  title: `My Profile | ${process.env.STORE_NAME} Affiliate Program`,
  description: `Update your ${process.env.STORE_NAME} affiliate profile details.`,
};

async function fetchProfile() {
  const h = await headers();

  const cookieHeader = h.get("cookie") || "";

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/affiliate/profile`, {
    method: "GET",
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  const data = await res.json().catch(() => ({}));
  return data;
}

export default async function ProfilePage() {
  const data = await fetchProfile();

  return (
    <main className={styles.pageWrap}>
      <section className={styles.heroCard}>
        <div className={styles.heroGlow}>
          <div className={styles.heroGlowLeft} />
          <div className={styles.heroGlowRight} />
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>Affiliate Profile</div>
          <h1 className={styles.heroTitle}>My Profile</h1>
          <p className={styles.heroDesc}>
            Update your basic details and password.
          </p>
        </div>
      </section>

      <div className={styles.formWrap}>
        <ProfileForm initialData={data} />
      </div>
    </main>
  );
}