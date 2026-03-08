import PaymentClient from "./payment-client";
import { getAffiliate } from "@/lib/affiliate";

import styles from "./page.module.css";

export const metadata = {
  title: "Affiliate Website Program Payment",
  description:
    "Website Affiliate Program at Ladies Church Suits, earn money by selling church attire and activate your affiliate website subscription.",
};

export default async function PaymentPage({ params }) {
  const { affiliate_id } = await params;

  const affiliateId = Number(affiliate_id);
  const affiliate_info = await getAffiliate(affiliateId);

  let telephone = affiliate_info?.telephone || "";
  if (telephone && telephone.length > 10) {
    telephone = telephone
      .split("")
      .reverse()
      .join("")
      .substring(0, 10)
      .split("")
      .reverse()
      .join("");
  }

  return (
    <main className={styles.page}>
      {/* Header */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}>
          <div className={styles.heroGlowLeft} />
          <div className={styles.heroGlowRight} />
        </div>

        <div className={styles.heroInner}>
          <div className={styles.badge}>Final Step</div>

          <h1 className={styles.title}>Complete Subscription Payment</h1>

          <p className={styles.desc}>
            Review your store details and activate your subscription securely.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className={styles.contentGrid}>
        {/* Left */}
        <aside className={styles.detailsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Store Details</h2>
            <p className={styles.cardDesc}>
              Please confirm the information below before paying.
            </p>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.infoBox}>
              <div className={styles.infoLabel}>Store Name</div>
              <div className={styles.infoValue}>
                {affiliate_info?.store_name || "-"}
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoBox}>
                <div className={styles.infoLabel}>Email</div>
                <div className={styles.infoValueSmall}>
                  {affiliate_info?.email ? (
                    <a
                      className={styles.inlineLink}
                      href={`mailto:${affiliate_info.email}`}
                    >
                      {affiliate_info.email}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoLabel}>Phone / Mobile</div>
                <div className={styles.infoValueSmall}>
                  {telephone ? (
                    <a className={styles.inlineLink} href={`tel:+1${telephone}`}>
                      {affiliate_info?.telephone}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>

            <div className={styles.noticeBox}>
              <div className={styles.noticeTitle}>Secure Payment</div>
              <p className={styles.noticeText}>
                Payments are processed by Stripe. Your card details are never
                stored on our server.
              </p>
            </div>
          </div>
        </aside>

        {/* Right */}
        <div className={styles.paymentWrap}>
          <PaymentClient affiliateId={affiliateId} />
        </div>
      </section>
    </main>
  );
}