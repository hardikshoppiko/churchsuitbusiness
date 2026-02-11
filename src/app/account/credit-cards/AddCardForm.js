"use client";

import { useEffect, useMemo, useState } from "react";

import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

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

      // set as default on server
      const res = await fetch("/api/affiliate/credit-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_default", payment_method: pmId }),
      });

      const j = await res.json().catch(() => ({}));
      if (!j?.ok) throw new Error(j?.message || "Failed to set default card");

      setMsg("Card added successfully.");
      
      if (onSuccess) {
        await onSuccess(); // ✅ allow parent to close + refresh
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
    <div className="space-y-4">
      {msg ? (
        <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
          {msg}
        </div>
      ) : null}

      <div className="rounded-2xl border bg-background p-4">
        <PaymentElement />
      </div>

      <Button className="w-full" onClick={submit} disabled={!stripe || submitting}>
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
          appearance: { theme: "stripe" },
        }
      : null;
  }, [clientSecret]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
        Loading payment form...
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {err}
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <Inner clientSecret={clientSecret} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}