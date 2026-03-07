import ForgotPasswordForm from "./ForgotPasswordForm";
import styles from "./page.module.css";

export const metadata = {
  title: `Forgot Password | ${process.env.STORE_NAME} Affiliate Program`,
  description: `Reset your password for your ${process.env.STORE_NAME} affiliate account.`,
};

export default function ForgotPasswordPage() {
  return (
    <main className={styles.pageBg}>
      <div className={styles.pageWrap}>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}