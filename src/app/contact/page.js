import { getSiteSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import ContactForm from "./ContactForm";
import styles from "./page.module.css";

export const metadata = {
  title: `Contact Us | ${process.env.STORE_NAME} Affiliate Program`,
  description: `Have questions or need support? Contact the ${process.env.STORE_NAME} affiliate team for assistance with your account, billing, or store setup.`,
};

function safeStr(v) {
  return String(v || "").trim();
}

export default async function ContactPage() {
  const [settingsData, session] = await Promise.all([
    getSiteSettings(0),
    getSession(),
  ]);

  const storeName = process.env.STORE_NAME;
  const storeEmail = process.env.NEXT_PUBLIC_STORE_EMAIL;
  const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE;
  const storePhoneText = storePhone.replace(/\D/g, "");
  const storeAddress = safeStr(settingsData?.config?.config_address) || "—";

  return (
    <div className={styles.pageBg}>
      <div className={styles.pageWrap}>
        {/* Header */}
        <div className={styles.heroCard}>
          <div className={styles.heroGlowWrap}>
            <div className={styles.heroGlowLeft} />
            <div className={styles.heroGlowRight} />
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              We usually reply within 24 hours
            </div>

            <h1 className={styles.heroTitle}>Contact Us</h1>

            <p className={styles.heroText}>
              Need help with your affiliate account, billing, or store setup?
              Send us a message and our team will get back to you as soon as
              possible.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className={styles.contentGrid}>
          {/* Form */}
          <Card className={styles.mainCard}>
            <CardHeader className={styles.mainCardHeader}>
              <CardTitle className={styles.mainCardTitle}>
                Send a message
              </CardTitle>
              <CardDescription className={styles.mainCardDescription}>
                {session?.firstname
                  ? `Hi ${session.firstname}, your details are already filled in.`
                  : "Fill out the form below and we’ll contact you."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ContactForm session={session} storeName={storeName} />
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className={styles.sidebarWrap}>
            <Card className={styles.sideCard}>
              <CardHeader className={styles.sideCardHeader}>
                <CardTitle className={styles.sideCardTitle}>
                  Contact Info
                </CardTitle>
                <CardDescription className={styles.sideCardDescription}>
                  Reach us directly
                </CardDescription>
              </CardHeader>

              <CardContent className={styles.sideCardContent}>
                <div className={styles.infoBox}>
                  <div className={styles.infoLabel}>Support Email</div>
                  <div className={styles.infoValueBreak}>
                    <a href={`mailto:${storeEmail}`} className={styles.contactLink}>{storeEmail}</a>
                  </div>
                </div>

                <div className={styles.infoBox}>
                  <div className={styles.infoLabel}>Phone</div>
                  <div className={styles.infoValue}>
                    <a href={`tel:+1${storePhoneText}`} className={styles.contactLink}>{storePhone}</a>
                  </div>
                </div>

                <div className={styles.infoBox}>
                  <div className={styles.infoLabel}>Address</div>
                  <div className={styles.infoText}>{storeAddress}</div>
                </div>

                <Separator className={styles.separator} />

                <div className={styles.questionBox}>
                  <div className={styles.questionTitle}>Common Questions</div>
                  <ul className={styles.questionList}>
                    <li>• Login / password help</li>
                    <li>• Billing & invoices</li>
                    <li>• Domain / website setup</li>
                    <li>• Affiliate account updates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}