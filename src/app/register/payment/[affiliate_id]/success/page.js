import Link from "next/link";

import { money, formatDate } from "@/lib/db-utils";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import SuccessClient from "./success-client";
import styles from "./page.module.css";

export const metadata = {
  title: "Payment Successful | Subscription Activated",
  description:
    "Your subscription payment was successful. Your affiliate account is now active and ready to use.",
  robots: { index: false, follow: false },
};

async function getSuccessInfo(affiliate_id) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(
    `${base}/api/affiliate/payment-intent?affiliate_id=${affiliate_id}`,
    { cache: "no-store" }
  );

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return { error: data?.message || "Could not load payment info" };
  }

  return data;
}

function IconBadge({ tone = "success" }) {
  const isSuccess = tone === "success";

  return (
    <div
      className={cn(
        styles.iconBadge,
        isSuccess ? styles.iconBadgeSuccess : styles.iconBadgeDanger
      )}
      aria-hidden="true"
    >
      <i
        className={cn(
          "fa-solid",
          styles.iconBadgeIcon,
          isSuccess ? "fa-circle-check" : "fa-circle-xmark"
        )}
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.infoValue}>{value ?? "-"}</div>
    </div>
  );
}

function MobileActionButtons() {
  return (
    <div className={styles.mobileActions}>
      <Button className={styles.primaryBtnMobile} asChild>
        <Link href="/account" className="text-decoration-none text-white">
          Go to Dashboard
        </Link>
      </Button>

      <Button className={styles.secondaryBtnMobile} variant="outline" asChild>
        <Link href="/" className="text-decoration-none">
          Back to Home
        </Link>
      </Button>
    </div>
  );
}

export default async function PaymentSuccessPage({ params, searchParams }) {
  const { affiliate_id } = await params;
  const resolvedSearchParams = await searchParams;

  if (!affiliate_id) {
    return (
      <main className={styles.pageWrap}>
        <div className={styles.simpleCard}>
          <div className={styles.simpleCardHeader}>
            <h1 className={styles.simpleCardTitle}>Invalid URL</h1>
            <p className={styles.simpleCardDesc}>Affiliate id is missing.</p>
          </div>

          <div className={styles.simpleCardBody}>
            <Button className={styles.primaryBtn} asChild>
              <Link href="/" className="text-decoration-none text-white">
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const redirectStatus = resolvedSearchParams?.redirect_status;
  let paymentIntent = resolvedSearchParams?.payment_intent || "";

  if (redirectStatus && redirectStatus !== "succeeded") {
    return (
      <main className={styles.pageWrap}>
        <div className={styles.simpleCard}>
          <div className={styles.failedHeader}>
            <IconBadge tone="danger" />
            <div>
              <h1 className={styles.simpleCardTitle}>Payment not completed</h1>
              <p className={styles.simpleCardDesc}>
                Your payment did not go through. Please try again.
              </p>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.simpleCardBodyActions}>
            <Button className={styles.primaryBtn} asChild>
              <Link
                href={`/register/payment/${affiliate_id}`}
                className="text-decoration-none text-white"
              >
                Retry Payment
              </Link>
            </Button>

            <Button className={styles.secondaryBtn} variant="outline" asChild>
              <Link href="/" className="text-decoration-none">
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const info = await getSuccessInfo(affiliate_id);

  if (info?.error) {
    return (
      <main className={styles.pageWrap}>
        <div className={styles.simpleCard}>
          <div className={styles.simpleCardHeader}>
            <h1 className={styles.simpleCardTitle}>Couldn’t load payment info</h1>
            <p className={styles.simpleCardDesc}>{info.error}</p>
          </div>

          <div className={styles.simpleCardBodyActions}>
            <Button className={styles.primaryBtn} asChild>
              <Link
                href={`/register/payment/${affiliate_id}`}
                className="text-decoration-none text-white"
              >
                Retry Payment
              </Link>
            </Button>

            <Button className={styles.secondaryBtn} variant="outline" asChild>
              <Link href="/" className="text-decoration-none">
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const aff = info.affiliate;
  const pay = info.latest_payment;

  const start_date = aff?.start_date ? formatDate(aff.start_date) : "";
  const end_date = aff?.end_date ? formatDate(aff.end_date) : "";

  if (!paymentIntent) paymentIntent = aff?.stripe_payment_intent_id || "";

  const storeName =
    aff?.store_name ||
    aff?.business_name ||
    `Affiliate #${aff?.affiliate_id || affiliate_id}`;

  const isSyncing =
    !pay ||
    !pay?.amount ||
    !pay?.invoice_number ||
    !pay?.start_date ||
    !pay?.end_date;

  return (
    <main className={styles.pageWrap}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}>
          <div className={styles.heroGlowLeft} />
          <div className={styles.heroGlowRight} />
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroTop}>
            <div className={styles.heroLeft}>
              <IconBadge tone="success" />

              <div className={styles.heroCopy}>
                <div className={styles.heroTitleRow}>
                  <h1 className={styles.heroTitle}>Payment Successful</h1>

                  <Badge className={styles.heroBadge} variant="secondary">
                    {isSyncing ? "Activation in Progress" : "Subscription Active"}
                  </Badge>
                </div>

                <p className={styles.heroDesc}>
                  {isSyncing
                    ? "Your payment has been received. We are activating your subscription and preparing your billing details."
                    : "Your subscription is active now. You can access your dashboard and start using your account."}
                </p>
              </div>
            </div>

            <div className={styles.heroActions}>
              <Button className={styles.primaryBtn} asChild>
                <Link href="/account" className="text-decoration-none text-white">
                  Go to Dashboard
                </Link>
              </Button>

              <Button className={styles.secondaryBtn} variant="outline" asChild>
                <Link href="/" className="text-decoration-none">
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className={styles.contentGrid}>
        {/* Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Subscription Details</h2>
            <p className={styles.cardDesc}>
              Confirm your store, billing period, and payment reference.
            </p>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.summaryBox}>
              {isSyncing ? (
                <div className={styles.pendingWrap}>
                  <div className={styles.pendingTitle}>
                    Subscription activation in progress
                  </div>

                  <p className={styles.pendingText}>
                    Your payment was successful. We are now preparing your invoice
                    and billing details.
                  </p>

                  <div className={styles.pendingGrid}>
                    <InfoRow label="Store" value={storeName} />
                    <InfoRow label="Email" value={aff?.email || "-"} />
                    <InfoRow label="Payment Intent" value={paymentIntent || "-"} />
                    <InfoRow label="Status" value="Processing..." />
                  </div>

                  <SuccessClient affiliateId={affiliate_id} />
                </div>
              ) : (
                <div className={styles.summaryGrid}>
                  <InfoRow label="Store" value={storeName} />
                  <InfoRow label="Email" value={aff?.email || "-"} />
                  <InfoRow label="Amount" value={pay ? money(pay.amount) : "-"} />
                  <InfoRow label="Invoice" value={pay?.invoice_number || "-"} />
                  <InfoRow
                    label="Billing Period"
                    value={
                      pay?.start_date
                        ? `${String(start_date)} → ${String(end_date)}`
                        : "-"
                    }
                  />
                  <InfoRow label="Payment Intent" value={paymentIntent || "-"} />
                </div>
              )}
            </div>

            <MobileActionButtons />

            <p className={styles.helpText}>Need help? Contact support.</p>
          </div>
        </div>

        {/* Next steps */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Next Steps</h2>
            <p className={styles.cardDesc}>
              Recommended actions after activation.
            </p>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.stepBox}>
              <div className={styles.stepTitle}>1) Login &amp; open dashboard</div>
              <p className={styles.stepText}>
                Manage your store settings and start your onboarding.
              </p>
            </div>

            <div className={styles.stepBox}>
              <div className={styles.stepTitle}>2) Verify your details</div>
              <p className={styles.stepText}>
                Confirm email, phone, and store name for billing and notifications.
              </p>
            </div>

            <div className={styles.divider} />

            <Button className={styles.primaryBtnFull} asChild>
              <Link href="/account" className="text-decoration-none text-white">
                Continue to Dashboard
              </Link>
            </Button>

            <Button className={styles.secondaryBtnFull} variant="outline" asChild>
              <Link href="/" className="text-decoration-none">
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}