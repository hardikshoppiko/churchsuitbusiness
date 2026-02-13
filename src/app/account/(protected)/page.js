import Link from "next/link";
import { getSession } from "@/lib/auth";

import { Button } from "@/components/ui/button";

import { formatDateTime, daysLeft, normalizeWebsite } from "@/lib/utils";

export const metadata = {
  title: `Account Dashboard | ${process.env.STORE_NAME} Affiliate Program`,
  description: `View your affiliate account details, plan status, and quick links | ${process.env.STORE_NAME} Affiliate Program`,
};

function StatCard({ title, value, sub, icon }) {
  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
          {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
        </div>

        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted/30 text-muted-foreground">
            <i className={`fa fa-${icon}`} aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground text-right break-all">
        {value || "—"}
      </div>
    </div>
  );
}

function QuickLink({ href, title, desc, icon }) {
  return (
    <Link href={href} className="block no-underline text-decoration-none">
      <div className="group rounded-2xl border bg-background p-4 transition hover:bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted/30 text-muted-foreground">
            <i className={`fa fa-${icon}`} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
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

  // Admin URL (yours)
  let adminUrl =
    website && affiliateId
      ? `${website}${process.env.ADMIN_LOGIN_ROUTE}&token=${process.env.ADMIN_LOGIN_TOKEN}&affiliate_id=${affiliateId}&user_id=${session?.affiliate_user_id || 0}&username=${encodeURIComponent(session?.username || "")}`
      : "";

  if (process.env.NODE_ENV === "development") {
    adminUrl = process.env.DEVELOPMENT_LOGIN_URL;
  }

  const hasAdmin = !!adminUrl;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border bg-background p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]">
          <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-primary">Affiliate Dashboard</div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              Welcome, {fullName} 👋
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Store: <span className="font-semibold text-foreground">{storeName}</span>
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {affiliateId ? (
                <span className="rounded-full border bg-muted/30 px-3 py-1">
                  Affiliate ID: <span className="font-semibold text-foreground">{affiliateId}</span>
                </span>
              ) : null}

              {email ? (
                <span className="rounded-full border bg-muted/30 px-3 py-1">
                  Email: <span className="font-semibold text-foreground">{email}</span>
                </span>
              ) : null}

              {websiteRaw ? (
                <span className="rounded-full border bg-muted/30 px-3 py-1">
                  Website: <span className="font-semibold text-foreground">{websiteRaw}</span>
                </span>
              ) : null}

              {/* ✅ Admin chip */}
              {/* {hasAdmin ? (
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border bg-muted/30 px-3 py-1 hover:bg-muted/50 inline-flex items-center gap-2"
                >
                  <span>Admin:</span>
                  <span className="font-semibold text-foreground">Open Panel</span>
                </a>
              ) : null} */}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/account/invoices" className="inline-flex no-underline text-decoration-none text-white">
              <Button className="w-full sm:w-auto">Invoices</Button>
            </Link>

            {/* ✅ Admin button */}
            {hasAdmin ? (
              <a
                href={adminUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full sm:w-auto text-decoration-none text-dark"
              >
                <Button variant="outline" className="w-full sm:w-auto">
                  <i className="fa fa-user-shield mr-2" aria-hidden="true" />
                  Admin Panel
                </Button>
              </a>
            ) : (
              <Button variant="outline" className="w-full sm:w-auto" disabled>
                <i className="fa fa-user-shield mr-2" aria-hidden="true" />
                Admin Panel
              </Button>
            )}

            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full sm:w-auto no-underline text-decoration-none text-dark"
              >
                <Button variant="outline" className="w-full sm:w-auto">
                  <i className="fa fa-globe mr-2" aria-hidden="true" />
                  Open Website
                </Button>
              </a>
            ) : (
              <Button variant="outline" className="w-full sm:w-auto" disabled>
                <i className="fa fa-globe mr-2" aria-hidden="true" />
                Open Website
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Plan Status" value={planStatus} sub={`Ends: ${formatDateTime(endDate)}`} icon="clock" />
        <StatCard title="Start Date" value={formatDateTime(startDate)} sub="Subscription started" icon="calendar" />
        <StatCard title="Store Name" value={storeName || "—"} sub="Your business store name" icon="store" />
        <StatCard title="Website" value={websiteRaw ? "Configured" : "Not set"} sub={websiteRaw || "Add website later"} icon="globe" />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="rounded-3xl border bg-background p-5 shadow-sm">
            <div>
              <div className="text-lg font-semibold tracking-tight">Quick Actions</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Common pages for your affiliate account.
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <QuickLink href="/account/invoices" title="Invoices" desc="View & download Stripe invoices" icon="file-invoice" />
              <QuickLink href="/account/profile" title="Profile" desc="Update your personal details" icon="user" />
              <QuickLink href="/account/credit-cards" title="Payment Method" desc="Manage payment method details" icon="credit-card" />
              <QuickLink href="/contact" title="Support" desc="Contact support for help" icon="life-ring" />
            </div>
          </div>

          {/* Recent activity placeholder */}
          <div className="rounded-3xl border bg-background p-5 shadow-sm">
            <div>
              <div className="text-lg font-semibold tracking-tight">Recent Activity</div>
              <div className="mt-1 text-sm text-muted-foreground">
                (Next: we can connect this with affiliate_activity table)
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                No recent activity to show yet.
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Account info */}
          <div className="rounded-3xl border bg-background p-5 shadow-sm">
            <div className="text-base font-semibold">Account Details</div>
            <div className="mt-3">
              <InfoRow label="Affiliate ID" value={affiliateId} />
              <InfoRow label="Email" value={email} />
              <InfoRow label="Phone" value={telephone} />
              <InfoRow label="Store Name" value={storeName} />
              <InfoRow label="Website" value={websiteRaw} />
            </div>
          </div>

          {/* Plan dates */}
          <div className="rounded-3xl border bg-muted/20 p-5">
            <div className="text-base font-semibold">Plan Timeline</div>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-3">
                <span>Start</span>
                <span className="font-semibold text-foreground">{formatDateTime(startDate)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>End</span>
                <span className="font-semibold text-foreground">{formatDateTime(endDate)}</span>
              </div>

              <div className="mt-3 rounded-xl border bg-background p-3 text-xs text-muted-foreground">
                {left == null
                  ? "Plan status not available."
                  : left < 0
                  ? "Your plan is expired. Please contact support to renew."
                  : left === 0
                  ? "Your plan ends today."
                  : `Your plan will end in ${left} day(s).`}
              </div>

              <div className="mt-3 grid gap-2">
                {/* ✅ Admin button also here */}
                {hasAdmin ? (
                  <a href={adminUrl} target="_blank" rel="noreferrer" className="inline-flex w-full no-underline text-decoration-none text-dark">
                    <Button variant="outline" className="w-full">
                      <i className="fa fa-user-shield mr-2" aria-hidden="true" />
                      Open Admin Panel
                    </Button>
                  </a>
                ) : (
                  <Button variant="outline" className="w-full text-decoration-none text-dark" disabled>
                    <i className="fa fa-user-shield mr-2" aria-hidden="true" />
                    Open Admin Panel
                  </Button>
                )}

                {website ? (
                  <a href={website} target="_blank" rel="noreferrer" className="inline-flex w-full no-underline text-decoration-none text-dark">
                    <Button variant="outline" className="w-full">
                      <i className="fa fa-globe mr-2" aria-hidden="true" />
                      Open Website
                    </Button>
                  </a>
                ) : (
                  <Button variant="outline" className="w-full text-decoration-none text-dark" disabled>
                    <i className="fa fa-globe mr-2" aria-hidden="true" />
                    Open Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}