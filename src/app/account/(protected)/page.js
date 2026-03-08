import Link from "next/link";
import { getSession } from "@/lib/auth";

import { Button } from "@/components/ui/button";

import { formatDateTime, daysLeft, normalizeWebsite } from "@/lib/utils";

import styles from "./page.module.css";

export const metadata = {
  title: `Account Dashboard | ${process.env.STORE_NAME} Affiliate Program`,
  description: `View your affiliate account details, plan status, and quick links | ${process.env.STORE_NAME} Affiliate Program`,
};

function StatCard({ title, value, sub, icon }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statCardTop}>
        <div className={styles.statCardText}>
          <div className={styles.statCardTitle}>{title}</div>
          <div className={styles.statCardValue}>{value}</div>
          {sub ? <div className={styles.statCardSub}>{sub}</div> : null}
        </div>

        {icon ? (
          <div className={styles.statCardIcon}>
            <i className={`fa fa-${icon}`} aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <div className={styles.infoRowLabel}>{label}</div>
      <div className={styles.infoRowValue}>{value || "—"}</div>
    </div>
  );
}

function QuickLink({ href, title, desc, icon }) {
  return (
    <Link href={href} className={styles.quickLinkWrap}>
      <div className={styles.quickLinkCard}>
        <div className={styles.quickLinkInner}>
          <div className={styles.quickLinkIcon}>
            <i className={`fa fa-${icon}`} aria-hidden="true" />
          </div>

          <div className={styles.quickLinkText}>
            <div className={styles.quickLinkTitle}>{title}</div>
            <div className={styles.quickLinkDesc}>{desc}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function AccountHome() {
  const session = await getSession();

  const firstname = session?.firstname || "Affiliate";
  const lastname = session?.lastname || "";
  const fullName = `${firstname}${lastname ? ` ${lastname}` : ""}`;

  const affiliateId = session?.affiliate_id ? String(session.affiliate_id) : "";
  const email = session?.email || "";
  const telephone = session?.telephone || "";
  const storeName = session?.store_name || "—";
  const websiteRaw = session?.website || "";
  const website = normalizeWebsite(websiteRaw);

  const startDate = session?.start_date || "";
  const endDate = session?.end_date || "";

  const left = daysLeft(endDate);
  const planStatus =
    left == null ? "—" : left < 0 ? "Expired" : left === 0 ? "Ends today" : `${left} days left`;

  let adminUrl =
    website && affiliateId
      ? `${website}${process.env.ADMIN_LOGIN_ROUTE}&token=${process.env.ADMIN_LOGIN_TOKEN}&affiliate_id=${affiliateId}&user_id=${session?.affiliate_user_id || 0}&username=${encodeURIComponent(session?.username || "")}`
      : "";

  if (process.env.NODE_ENV === "development") {
    adminUrl = process.env.DEVELOPMENT_LOGIN_URL;
  }

  const hasAdmin = !!adminUrl;

  return (
    <main className={styles.pageWrap}>
      {/* Hero */}
      <section className={styles.heroCard}>
        <div className={styles.heroGlow}>
          <div className={styles.heroGlowLeft} />
          <div className={styles.heroGlowRight} />
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroTop}>
            <div className={styles.heroText}>
              <div className={styles.heroEyebrow}>Affiliate Dashboard</div>

              <h1 className={styles.heroTitle}>Welcome, {fullName} 👋</h1>

              <p className={styles.heroStore}>
                Store: <span className={styles.heroStoreStrong}>{storeName}</span>
              </p>

              <div className={styles.heroChips}>
                {affiliateId ? (
                  <span className={styles.heroChip}>
                    Affiliate ID:{" "}
                    <span className={styles.heroChipStrong}>{affiliateId}</span>
                  </span>
                ) : null}

                {email ? (
                  <span className={styles.heroChip}>
                    Email: <span className={styles.heroChipStrong}>{email}</span>
                  </span>
                ) : null}

                {websiteRaw ? (
                  <span className={styles.heroChip}>
                    Website:{" "}
                    <span className={styles.heroChipStrong}>{websiteRaw}</span>
                  </span>
                ) : null}
              </div>
            </div>

            <div className={styles.heroActions}>
              <Link
                href="/account/invoices"
                className="inline-flex no-underline text-decoration-none text-white"
              >
                <Button className={styles.primaryButton}>Invoices</Button>
              </Link>

              {hasAdmin ? (
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full sm:w-auto text-decoration-none"
                >
                  <Button variant="outline" className={styles.secondaryButton}>
                    <i className="fa fa-user-shield mr-2" aria-hidden="true" />
                    Admin Panel
                  </Button>
                </a>
              ) : (
                <Button variant="outline" className={styles.secondaryButton} disabled>
                  <i className="fa fa-user-shield mr-2" aria-hidden="true" />
                  Admin Panel
                </Button>
              )}

              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full sm:w-auto text-decoration-none"
                >
                  <Button variant="outline" className={styles.secondaryButton}>
                    <i className="fa fa-globe mr-2" aria-hidden="true" />
                    Open Website
                  </Button>
                </a>
              ) : (
                <Button variant="outline" className={styles.secondaryButton} disabled>
                  <i className="fa fa-globe mr-2" aria-hidden="true" />
                  Open Website
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsGrid}>
        <StatCard
          title="Plan Status"
          value={planStatus}
          sub={`Ends: ${formatDateTime(endDate)}`}
          icon="clock"
        />
        <StatCard
          title="Start Date"
          value={formatDateTime(startDate)}
          sub="Subscription started"
          icon="calendar"
        />
        <StatCard
          title="Store Name"
          value={storeName || "—"}
          sub="Your business store name"
          icon="store"
        />
        <StatCard
          title="Website"
          value={websiteRaw ? "Configured" : "Not set"}
          sub={websiteRaw || "Add website later"}
          icon="globe"
        />
      </section>

      {/* Main grid */}
      <section className={styles.mainGrid}>
        {/* Left */}
        <div className={styles.leftColumn}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Quick Actions</div>
              <div className={styles.panelDesc}>
                Common pages for your affiliate account.
              </div>
            </div>

            <div className={styles.quickGrid}>
              <QuickLink
                href="/account/invoices"
                title="Invoices"
                desc="View & download Stripe invoices"
                icon="file-invoice"
              />
              <QuickLink
                href="/account/profile"
                title="Profile"
                desc="Update your personal details"
                icon="user"
              />
              <QuickLink
                href="/account/credit-cards"
                title="Payment Method"
                desc="Manage payment method details"
                icon="credit-card"
              />
              <QuickLink
                href="/contact"
                title="Support"
                desc="Contact support for help"
                icon="life-ring"
              />
            </div>
          </div>

          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Recent Activity</div>
              <div className={styles.panelDesc}>
                (Next: we can connect this with affiliate_activity table)
              </div>
            </div>

            <div className={styles.emptyState}>
              No recent activity to show yet.
            </div>
          </div>
        </div>

        {/* Right */}
        <div className={styles.rightColumn}>
          <div className={styles.panelCard}>
            <div className={styles.panelTitleSmall}>Account Details</div>

            <div className={styles.infoTable}>
              <InfoRow label="Affiliate ID" value={affiliateId} />
              <InfoRow label="Email" value={email} />
              <InfoRow label="Phone" value={telephone} />
              <InfoRow label="Store Name" value={storeName} />
              <InfoRow label="Website" value={websiteRaw} />
            </div>
          </div>

          <div className={styles.timelineCard}>
            <div className={styles.panelTitleSmall}>Plan Timeline</div>

            <div className={styles.timelineRows}>
              <div className={styles.timelineRow}>
                <span>Start</span>
                <span className={styles.timelineStrong}>
                  {formatDateTime(startDate)}
                </span>
              </div>

              <div className={styles.timelineRow}>
                <span>End</span>
                <span className={styles.timelineStrong}>
                  {formatDateTime(endDate)}
                </span>
              </div>
            </div>

            <div className={styles.timelineNote}>
              {left == null
                ? "Plan status not available."
                : left < 0
                ? "Your plan is expired. Please contact support to renew."
                : left === 0
                ? "Your plan ends today."
                : `Your plan will end in ${left} day(s).`}
            </div>

            <div className={styles.timelineActions}>
              {hasAdmin ? (
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full text-decoration-none"
                >
                  <Button variant="outline" className={styles.secondaryButtonFull}>
                    <i className="fa fa-user-shield mr-2" aria-hidden="true" />
                    Open Admin Panel
                  </Button>
                </a>
              ) : (
                <Button
                  variant="outline"
                  className={styles.secondaryButtonFull}
                  disabled
                >
                  <i className="fa fa-user-shield mr-2" aria-hidden="true" />
                  Open Admin Panel
                </Button>
              )}

              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full text-decoration-none"
                >
                  <Button variant="outline" className={styles.secondaryButtonFull}>
                    <i className="fa fa-globe mr-2" aria-hidden="true" />
                    Open Website
                  </Button>
                </a>
              ) : (
                <Button
                  variant="outline"
                  className={styles.secondaryButtonFull}
                  disabled
                >
                  <i className="fa fa-globe mr-2" aria-hidden="true" />
                  Open Website
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}