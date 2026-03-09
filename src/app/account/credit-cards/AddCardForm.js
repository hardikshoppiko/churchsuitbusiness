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

import styles from "./AddCardForm.module.css";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function Inner({ clientSecret, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");
    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (error) throw new Error(error.message || "Failed to add card");

      const pmId = setupIntent?.payment_method;
      if (!pmId) throw new Error("Payment method not returned by Stripe");

      const res = await fetch("/api/affiliate/credit-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_default", payment_method: pmId }),
      });

      const j = await res.json().catch(() => ({}));
      if (!j?.ok) throw new Error(j?.message || "Failed to set default card");

      setMsg("Card added successfully.");

      if (onSuccess) {
        await onSuccess();
      }
    } catch (e) {
      const m = String(e?.message || "Failed to add card");
      setMsg(m);
      onError?.(m);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.inner}>
      {msg ? <div className={styles.messageBox}>{msg}</div> : null}

      <div className={styles.formShell}>
        <div className={styles.formHeader}>
          <div className={styles.headerIcon}>
            <i className="fa fa-credit-card" aria-hidden="true" />
          </div>

          <div className={styles.headerText}>
            <div className={styles.headerTitle}>Secure Card Setup</div>
            <div className={styles.headerDesc}>
              Your payment details are encrypted and securely processed by Stripe.
            </div>
          </div>
        </div>

        <div className={styles.formBody}>
          <div className={styles.paymentElementArea}>
            <PaymentElement />
          </div>
        </div>
      </div>

      <Button
        className={styles.submitButton}
        onClick={submit}
        disabled={!stripe || submitting}
      >
        {submitting ? "Saving..." : "Save Card & Set Default"}
      </Button>
    </div>
  );
}

export default function AddCardForm({ onSuccess, onError }) {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch("/api/affiliate/credit-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_setup_intent" }),
        });

        const j = await res.json().catch(() => ({}));
        if (!j?.ok || !j?.client_secret) {
          throw new Error(j?.message || "Failed to initialize card setup");
        }

        if (mounted) setClientSecret(j.client_secret);
      } catch (e) {
        const m = String(e?.message || "Failed to initialize");
        if (mounted) setErr(m);
        onError?.(m);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [onError]);

  const options = useMemo(() => {
    return clientSecret
      ? {
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#7d48c8",
              colorText: "#1f2937",
              colorTextSecondary: "#6b7280",
              colorDanger: "#dc2626",
              colorBackground: "#ffffff",
              colorIcon: "#7d48c8",
              borderRadius: "12px",
              fontSizeBase: "14px",
              spacingUnit: "3px",
            },
            rules: {
              ".Input": {
                border: "1px solid #e9d8fd",
                boxShadow: "none",
                padding: "10px 12px",
              },
              ".Input:focus": {
                border: "1px solid #c4b5fd",
                boxShadow: "0 0 0 3px rgba(125,72,200,0.10)",
              },
              ".Label": {
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              },
              ".Tab": {
                border: "1px solid #e9d8fd",
                boxShadow: "none",
                backgroundColor: "#ffffff",
              },
              ".Tab:hover": {
                color: "#7d48c8",
              },
              ".Tab--selected": {
                borderColor: "#c4b5fd",
                backgroundColor: "#faf7ff",
                color: "#7d48c8",
              },
              ".Block": {
                boxShadow: "none",
              },
            },
          },
        }
      : null;
  }, [clientSecret]);

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.loadingTitle}>Loading payment form...</div>
        <div className={styles.loadingDesc}>
          Please wait while secure card setup is prepared.
        </div>
      </div>
    );
  }

  if (err) {
    return <div className={styles.errorBox}>{err}</div>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <Inner
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}