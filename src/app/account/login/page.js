import { Suspense } from "react";
import LoginForm from "./LoginForm";
import styles from "./page.module.css";

export const metadata = {
  title: `Affiliate Login | ${process.env.NEXT_PUBLIC_STORE_NAME}`,
  description: `Login to your Affiliate account | ${process.env.NEXT_PUBLIC_STORE_NAME}`,
};

export default function LoginPage() {
  return (
    <main className={styles.pageBg}>
      <div className={styles.pageWrap}>
        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

function LoginFallback() {
  return (
    <div className={styles.fallbackCard}>
      <div className={styles.fallbackGrid}>
        <div className={styles.fallbackLeft}>
          <div className={styles.skTitle} />
          <div className={styles.skInput} />
          <div className={styles.skInput} />
          <div className={styles.skButton} />
          <div className={styles.skSmall} />
        </div>

        <div className={styles.fallbackRight} />
      </div>
    </div>
  );
}