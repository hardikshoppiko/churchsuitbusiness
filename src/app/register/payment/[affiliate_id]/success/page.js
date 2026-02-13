import Link from "next/link";

import { money, formatDate } from "@/lib/db-utils";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
        "flex h-12 w-12 items-center justify-center rounded-2xl border",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      )}
      aria-hidden="true"
    >
      <i className={cn("fa-solid text-xl", isSuccess ? "fa-circle-check" : "fa-circle-xmark")} />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold break-words">{value ?? "-"}</div>
    </div>
  );
}

export default async function PaymentSuccessPage({ params, searchParams }) {
  // ✅ params in Next.js can be a Promise sometimes
  const { affiliate_id } = await params;

  if (!affiliate_id) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Invalid URL</CardTitle>
            <CardDescription>Affiliate id is missing.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ✅ In App Router, searchParams is an object (no need await)
  const redirectStatus = searchParams?.redirect_status; // "succeeded" | "failed"
  let paymentIntent = searchParams?.payment_intent || "";

  // If Stripe redirect says failed
  if (redirectStatus && redirectStatus !== "succeeded") {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <Card className="rounded-2xl">
          <CardHeader className="space-y-4">
            <div className="flex items-start gap-4">
              <IconBadge tone="danger" />
              <div className="space-y-1">
                <CardTitle className="text-xl">Payment not completed</CardTitle>
                <CardDescription>
                  Your payment did not go through. Please try again.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`/register/payment/${affiliate_id}`}>Retry Payment</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const info = await getSuccessInfo(affiliate_id);

  if (info?.error) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <Card className="rounded-2xl">
          <CardHeader className="space-y-2">
            <CardTitle>Couldn’t load payment info</CardTitle>
            <CardDescription>{info.error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/register/payment/${affiliate_id}`}>Retry Payment</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const aff = info.affiliate;
  const pay = info.latest_payment;

  const start_date = formatDate(aff.start_date);
  const end_date = formatDate(aff.end_date);

  if (!paymentIntent) paymentIntent = aff?.stripe_payment_intent_id || "";

  const storeName = aff?.store_name || aff?.business_name || `Affiliate #${aff?.affiliate_id || affiliate_id}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <IconBadge tone="success" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Payment Successful</h1>
              <Badge className="rounded-full text-white" variant="secondary">
                Subscription Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Your subscription is active now. You can access your dashboard and start using your account.
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button asChild>
            <Link href="/account" className="text-decoration-none text-white">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="text-decoration-none text-dark">Back to Home</Link>
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Details Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Subscription Details</CardTitle>
            <CardDescription>
              Confirm your store, billing period, and payment reference.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
            </div>

            <div className="flex flex-wrap gap-2 md:hidden">
              <Button className="w-full sm:w-auto" asChild>
                <Link href="/account">Go to Dashboard</Link>
              </Button>
              <Button className="w-full sm:w-auto" variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Need help? Contact support.
            </p>
          </CardContent>
        </Card>

        {/* Next steps card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Next Steps</CardTitle>
            <CardDescription>Recommended actions after activation.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border p-4">
              <div className="text-sm font-semibold">1) Login & open dashboard</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your store settings and start your onboarding.
              </p>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="text-sm font-semibold">2) Verify your details</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Confirm email, phone, and store name for billing and notifications.
              </p>
            </div>

            <Separator />

            <Button className="w-full" asChild>
              <Link href="/account" className="text-white text-decoration-none">Continue to Dashboard</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/" className="text-decoration-none text-dark">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}