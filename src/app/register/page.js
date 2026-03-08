import RegisterWizardForm from "./RegisterWizardForm";

import { getAffiliatePlans } from "@/lib/affiliate";
import { getCountries } from "@/lib/geo";
import { getSiteSettings } from "@/lib/settings";

import styles from "./page.module.css";

export const metadata = {
  title: "Affiliate Website Program",
  description:
    "Earn money selling church attire and start your affiliate store.",
};

export default async function RegisterPage() {
  const [plans, countries, settings] = await Promise.all([
    getAffiliatePlans(),
    getCountries(),
    getSiteSettings(0),
  ]);

  const defaultCountryId = Number(settings?.config?.config_country_id || 0);
  const defaultZoneId = Number(settings?.config?.config_zone_id || 0);

  return (
    <main className={styles.page}>
      {/* HEADER */}
      <div className={styles.headerCard}>
        <div className={styles.headerGlow}>
          <div className={styles.glowLeft}></div>
          <div className={styles.glowRight}></div>
        </div>

        <div className={styles.headerInner}>
          <div className={styles.badge}>3 Step Registration</div>

          <h1 className={styles.headerTitle}>
            New Affiliate / Dropshipping Registration
          </h1>

          <p className={styles.headerDesc}>
            Create your affiliate store and start selling online in just a few
            minutes.
          </p>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepLabel}>STEP 1</div>
              <div className={styles.stepTitle}>Personal Info</div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepLabel}>STEP 2</div>
              <div className={styles.stepTitle}>Plan & Domain</div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepLabel}>STEP 3</div>
              <div className={styles.stepTitle}>Address & Password</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.wizardWrap}>
        <RegisterWizardForm
          plans={plans}
          countries={countries}
          defaultCountryId={defaultCountryId}
          defaultZoneId={defaultZoneId}
        />
      </div>
    </main>
  );
}