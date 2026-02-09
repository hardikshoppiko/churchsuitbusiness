"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ affiliateId }) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function onPay(e) {
    e.preventDefault();
    setErr(null);

    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/register/payment/${affiliateId}/success`,
      },
    });

    if (error) {
      setErr(error.message || "Payment failed.");
      setLoading(false);
      return;
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">Payment</CardTitle>
        <CardDescription>
          Choose your payment method and confirm.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {err ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="text-sm font-semibold">Payment Error</div>
            <div className="mt-1 text-sm">{err}</div>
          </div>
        ) : null}

        <form onSubmit={onPay} className="space-y-4">
          <div className="rounded-xl border bg-background p-4">
            <PaymentElement
              options={{
                layout: {
                  type: "tabs",
                  defaultCollapsed: false,
                },
              }}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!stripe || loading}
          >
            {loading ? "Processing..." : "Pay now & Activate Subscription"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Payments are processed by Stripe securely.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function PaymentClient({ affiliateId }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [paid, setPaid] = useState(false);
  const [err, setErr] = useState(null);

  if (!affiliateId || Number.isNaN(Number(affiliateId))) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        <div className="text-sm font-semibold">Invalid URL</div>
        <div className="mt-1 text-sm">Invalid affiliate id in URL.</div>
      </div>
    );
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      setErr(null);

      const res = await fetch(`/api/affiliate/payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliate_id: affiliateId }),
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!mounted) return;

      if (!res.ok) {
        setErr(data?.message || "Could not initialize payment.");
        return;
      }

      if (data.affiliate_status === "paid") {
        setPaid(true);
        return;
      }

      setClientSecret(data.clientSecret);
    }

    init();
    return () => {
      mounted = false;
    };
  }, [affiliateId]);

  // ✅ Shadcn-like Stripe appearance
  const options = useMemo(() => {
    if (!clientSecret) return null;

    return {
      clientSecret,
      appearance: {
        theme: "flat",
        labels: "floating",

        variables: {
          // Font (close to shadcn default: Inter)
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",

          // Colors (neutral shadcn feel)
          colorText: "hsl(222.2 84% 4.9%)",
          colorTextSecondary: "hsl(215.4 16.3% 46.9%)",
          colorTextPlaceholder: "hsl(215.4 16.3% 46.9%)",

          colorBackground: "hsl(0 0% 100%)",
          colorPrimary: "hsl(221.2 83.2% 53.3%)", // primary-ish blue
          colorDanger: "hsl(0 84.2% 60.2%)",

          // Borders / radius
          borderRadius: "12px",
          borderWidth: "1px",

          // Spacing
          spacingUnit: "6px",
        },

        rules: {
          // Base input style
          ".Input": {
            border: "1px solid hsl(214.3 31.8% 91.4%)",
            boxShadow: "none",
            backgroundColor: "hsl(0 0% 100%)",
          },

          // Focus ring like shadcn
          ".Input:focus": {
            border: "1px solid hsl(221.2 83.2% 53.3%)",
            boxShadow: "0 0 0 4px hsl(221.2 83.2% 53.3% / 0.15)",
          },

          // Floating labels
          ".Label": {
            color: "hsl(215.4 16.3% 46.9%)",
            fontWeight: "600",
          },

          // Tabs look cleaner
          ".Tab": {
            border: "1px solid hsl(214.3 31.8% 91.4%)",
            borderRadius: "12px",
            backgroundColor: "hsl(0 0% 100%)",
          },
          ".Tab:hover": {
            backgroundColor: "hsl(210 40% 98%)",
          },
          ".Tab--selected": {
            borderColor: "hsl(221.2 83.2% 53.3%)",
            boxShadow: "0 0 0 4px hsl(221.2 83.2% 53.3% / 0.12)",
          },

          // Errors
          ".Input--invalid": {
            borderColor: "hsl(0 84.2% 60.2%)",
          },
          ".Input--invalid:focus": {
            boxShadow: "0 0 0 4px hsl(0 84.2% 60.2% / 0.15)",
          },
          ".Error": {
            color: "hsl(0 84.2% 60.2%)",
          },

          // Block container inside PaymentElement
          ".Block": {
            border: "1px solid hsl(214.3 31.8% 91.4%)",
            borderRadius: "16px",
          },
        },
      },
    };
  }, [clientSecret]);

  if (paid) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Payment Status</CardTitle>
          <CardDescription>Subscription already active.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <div className="text-sm font-semibold">Payment Completed</div>
            <div className="mt-1 text-sm">Payment already completed.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (err) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Payment Status</CardTitle>
          <CardDescription>We couldn’t start payment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="text-sm font-semibold">Error</div>
            <div className="mt-1 text-sm">{err}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret || !options) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Payment</CardTitle>
          <CardDescription>Loading secure payment form…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
          <div className="mt-3 h-24 w-full animate-pulse rounded-xl bg-muted" />
          <div className="mt-3 h-10 w-full animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm affiliateId={affiliateId} />
    </Elements>
  );
}