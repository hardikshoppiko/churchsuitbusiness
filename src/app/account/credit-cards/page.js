import { headers } from "next/headers";

import CreditCardsClient from "./CreditCardsClient";
import styles from "./page.module.css";

export const metadata = {
  title: `Payment Method | ${process.env.STORE_NAME} Affiliate Program`,
  description: `Manage your saved Payment Method for billing in the ${process.env.STORE_NAME} Affiliate Program. Add new cards, remove old ones, and set your default payment method for seamless transactions.`,
};

async function fetchCards() {
  const h = await headers();
  const cookieHeader = h.get("cookie") || "";

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/affiliate/credit-cards`, {
    method: "GET",
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  const data = await res.json().catch(() => ({}));
  return data;
}

export default async function CreditCardsPage() {
  const data = await fetchCards();

  return (
    <main className={styles.pageWrap}>
      <section className={styles.heroCard}>
        <div className={styles.heroGlow}>
          <div className={styles.heroGlowLeft} />
          <div className={styles.heroGlowRight} />
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>Billing &amp; Payments</div>
          <h1 className={styles.heroTitle}>Payment Method</h1>
          <p className={styles.heroDesc}>
            Add a new card, remove old cards, and manage your default payment
            method for subscription billing.
          </p>
        </div>
      </section>

      <div className={styles.contentWrap}>
        <CreditCardsClient initialData={data} />
      </div>
    </main>
  );
}