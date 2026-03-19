"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function PaymentBackButton() {
  const router = useRouter();

  function handleBack() {
    router.push("/register");
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleBack}
      className={styles.backLinkBtn}
    >
      ← Back to Registration
    </Button>
  );
}