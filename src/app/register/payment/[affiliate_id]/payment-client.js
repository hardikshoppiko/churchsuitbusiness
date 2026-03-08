"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";

import styles from "./payment-client.module.css";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

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
    <div className={styles.paymentCard}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Payment</h2>
        <p className={styles.cardDesc}>
          Choose your payment method and confirm your subscription.
        </p>
      </div>

      <div className={styles.cardBody}>
        {err ? (
          <div className={styles.errorBox}>
            <div className={styles.errorTitle}>Payment Error</div>
            <div className={styles.errorText}>{err}</div>
          </div>
        ) : null}

        <form onSubmit={onPay} className={styles.form}>
          <div className={styles.stripeWrap}>
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
            className={styles.payBtn}
            size="lg"
            disabled={!stripe || loading}
          >
            {loading ? "Processing..." : "Pay now & Activate Subscription"}
          </Button>

          <p className={styles.secureText}>
            Payments are processed securely by Stripe.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function PaymentClient({ affiliateId }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [paid, setPaid] = useState(false);
  const [err, setErr] = useState(null);

  if (!affiliateId || Number.isNaN(Number(affiliateId))) {
    return (
      <div className={styles.errorStateCard}>
        <div className={styles.errorBox}>
          <div className={styles.errorTitle}>Invalid URL</div>
          <div className={styles.errorText}>Invalid affiliate id in URL.</div>
        </div>
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

  const options = useMemo(() => {
    if (!clientSecret) return null;

    return {
      clientSecret,
      appearance: {
        theme: "flat",
        labels: "floating",
        variables: {
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",

          colorText: "#111827",
          colorTextSecondary: "#6b7280",
          colorTextPlaceholder: "#9ca3af",

          colorBackground: "#ffffff",
          colorPrimary: "#7d48c8",
          colorDanger: "#dc2626",

          borderRadius: "14px",
          borderWidth: "1px",
          spacingUnit: "6px",
        },
        rules: {
          ".Input": {
            border: "1px solid #e5d8f7",
            boxShadow: "none",
            backgroundColor: "#ffffff",
          },
          ".Input:focus": {
            border: "1px solid #7d48c8",
            boxShadow: "0 0 0 4px rgba(125,72,200,0.14)",
          },
          ".Label": {
            color: "#6b7280",
            fontWeight: "600",
          },
          ".Tab": {
            border: "1px solid #e5d8f7",
            borderRadius: "14px",
            backgroundColor: "#ffffff",
          },
          ".Tab:hover": {
            backgroundColor: "#faf7ff",
          },
          ".Tab--selected": {
            borderColor: "#7d48c8",
            boxShadow: "0 0 0 4px rgba(125,72,200,0.12)",
          },
          ".Input--invalid": {
            borderColor: "#dc2626",
          },
          ".Input--invalid:focus": {
            boxShadow: "0 0 0 4px rgba(220,38,38,0.14)",
          },
          ".Error": {
            color: "#dc2626",
          },
          ".Block": {
            border: "1px solid #eadcff",
            borderRadius: "18px",
          },
        },
      },
    };
  }, [clientSecret]);

  if (paid) {
    return (
      <div className={styles.paymentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Payment Status</h2>
          <p className={styles.cardDesc}>Subscription already active.</p>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.successBox}>
            <div className={styles.successTitle}>Payment Completed</div>
            <div className={styles.successText}>
              Payment already completed.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className={styles.paymentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Payment Status</h2>
          <p className={styles.cardDesc}>We couldn’t start payment.</p>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.errorBox}>
            <div className={styles.errorTitle}>Error</div>
            <div className={styles.errorText}>{err}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret || !options) {
    return (
      <div className={styles.paymentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Payment</h2>
          <p className={styles.cardDesc}>Loading secure payment form…</p>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonBlock} />
          <div className={styles.skeletonLine} />
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm affiliateId={affiliateId} />
    </Elements>
  );
}