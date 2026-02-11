import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = {
  title: `Forgot Password | ${process.env.STORE_NAME} Affiliate Program`,
  description: `Reset your password for your ${process.env.STORE_NAME} affiliate account. Enter your email or phone number to receive password reset instructions and regain access to your account.`,
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <ForgotPasswordForm />
    </div>
  );
}