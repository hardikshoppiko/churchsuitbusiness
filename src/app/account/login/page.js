import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Affiliate Login | Church Suit Business",
  description: "Login to your Affiliate account | Church Suit Business",
};

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-70px)] bg-muted/40">
      <div className="container flex min-h-[calc(100vh-70px)] items-center justify-center py-8">
        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

function LoginFallback() {
  return (
    <div className="w-full max-w-4xl rounded-2xl border bg-background p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* left skeleton */}
        <div className="space-y-4">
          <div className="h-7 w-40 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>

        {/* right skeleton */}
        <div className="hidden lg:block rounded-xl bg-muted" />
      </div>
    </div>
  );
}