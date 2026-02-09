"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SuccessClient({ affiliateId }) {
  const router = useRouter();
  const [msg, setMsg] = useState("Confirming payment...");

  useEffect(() => {
    let mounted = true;

    async function run() {
      // Optional: ping your backend to re-check status
      // But the real activation will happen via webhook.
      // We'll do a light polling for a short time.
      const id = Number(affiliateId);
      if (!id) {
        setMsg("Invalid affiliate id.");
        return;
      }

      for (let i = 0; i < 10; i++) {
        const res = await fetch(`/api/affiliate/status?affiliate_id=${id}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));

        if (!mounted) return;

        if (res.ok && Number(data.affiliate_status_id) === 2) {
          setMsg("Payment confirmed. Redirecting...");
          router.replace("/");
          return;
        }

        await new Promise((r) => setTimeout(r, 1500));
      }

      setMsg("Payment still processing. Please refresh in a moment.");
    }

    run();

    return () => {
      mounted = false;
    };
  }, [affiliateId, router]);

  return <div className="alert alert-info">{msg}</div>;
}