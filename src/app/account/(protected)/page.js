import { getSession } from "@/lib/auth";
import { formatDateTime, daysLeft } from "@/lib/utils";

import AccountSubnav from "./_components/AccountSubnav";
import styles from "./page.module.css";

export const metadata = {
  title: `Account Dashboard | ${process.env.STORE_NAME} Affiliate Program`,
  description: `View your affiliate account details and subscription status | ${process.env.STORE_NAME} Affiliate Program`,
};

function SideStatCard({ title, value, sub, icon }) {
  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardTop}>
        <div className={styles.sideCardText}>
          <div className={styles.sideCardTitle}>{title}</div>
          <div className={styles.sideCardValue}>{value}</div>
          {sub ? <div className={styles.sideCardSub}>{sub}</div> : null}
        </div>

        {icon ? (
          <div className={styles.sideCardIcon}>
            <i className={`fa fa-${icon}`} aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default async function AccountHome() {
  const session = await getSession();

  const firstname = session?.firstname || "Affiliate";
  const lastname = session?.lastname || "";
  const fullName = `${firstname}${lastname ? ` ${lastname}` : ""}`;

  const affiliateId = session?.affiliate_id ? String(session.affiliate_id) : "";
  const email = session?.email || "";
  const storeName = session?.store_name || "—";
  const websiteRaw = session?.website || "—";

  const startDate = session?.start_date || "";
  const endDate = session?.end_date || "";

  const left = daysLeft(endDate);
  const planStatus =
    left == null
      ? "—"
      : left < 0
      ? "Expired"
      : left === 0
      ? "Ends today"
      : `${left} days left`;

  const planSubText =
    left == null
      ? "Subscription status unavailable"
      : left < 0
      ? "Your subscription has expired"
      : "Active subscription";

  return (
    <main className={styles.pageWrap}>
      <AccountSubnav active="/account" />

      <section className={styles.dashboardGrid}>
        {/* Left big dashboard card */}
        <div className={styles.dashboardCard}>
          <div className={styles.dashboardGlow}>
            <div className={styles.dashboardGlowLeft} />
            <div className={styles.dashboardGlowRight} />
          </div>

          <div className={styles.dashboardInner}>
            <div className={styles.dashboardEyebrow}>Affiliate Dashboard</div>

            <h1 className={styles.dashboardTitle}>Welcome, {fullName}</h1>

            <p className={styles.dashboardDesc}>
              Manage your affiliate account and review your subscription details from one place.
            </p>

            <div className={styles.dashboardInfoGrid}>
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Store Name</div>
                <div className={styles.infoValue}>{storeName}</div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Email</div>
                <div className={styles.infoValue}>{email || "—"}</div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Website</div>
                <div className={styles.infoValue}>{websiteRaw || "—"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side stacked cards */}
        <div className={styles.rightStack}>
          <SideStatCard
            title="Plan Status"
            value={planStatus}
            sub={planSubText}
            icon="clock"
          />

          <SideStatCard
            title="End Date"
            value={endDate ? formatDateTime(endDate) : "—"}
            sub="Billing period end"
            icon="calendar"
          />
        </div>
      </section>
    </main>
  );
}