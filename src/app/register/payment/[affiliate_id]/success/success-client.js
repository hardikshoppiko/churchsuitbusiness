"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./success-client.module.css";

export default function SuccessClient({ affiliateId }) {
  const router = useRouter();
  const [msg, setMsg] = useState(
    "We received your payment. Your subscription is being activated..."
  );
  const [subMsg, setSubMsg] = useState(
    "Please wait a few seconds while we prepare your invoice and billing details."
  );

  useEffect(() => {
    let mounted = true;

    async function run() {
      const id = Number(affiliateId);
      if (!id) {
        setMsg("Invalid affiliate id.");
        setSubMsg("");
        return;
      }

      for (let i = 0; i < 15; i++) {
        const res = await fetch(`/api/affiliate/payment-intent?affiliate_id=${id}`, {
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!mounted) return;

        const aff = data?.affiliate;
        const pay = data?.latest_payment;

        const ready =
          res.ok &&
          aff &&
          pay &&
          pay?.amount &&
          pay?.invoice_number &&
          pay?.start_date &&
          pay?.end_date;

        if (ready) {
          setMsg("Your subscription has been activated.");
          setSubMsg("Refreshing your payment details...");
          setTimeout(() => {
            router.refresh();
          }, 800);
          return;
        }

        setMsg("We received your payment. Your subscription is being activated...");
        setSubMsg("This usually takes only a few seconds.");
        await new Promise((r) => setTimeout(r, 2500));
      }

      setMsg("Payment received successfully.");
      setSubMsg(
        "Your account is still being finalized. Please refresh this page in a few seconds."
      );
    }

    run();

    return () => {
      mounted = false;
    };
  }, [affiliateId, router]);

  return (
    <div className={styles.statusBox}>
      <div className={styles.loader} />
      <div>
        <div className={styles.statusTitle}>{msg}</div>
        {subMsg ? <div className={styles.statusText}>{subMsg}</div> : null}
      </div>
    </div>
  );
}