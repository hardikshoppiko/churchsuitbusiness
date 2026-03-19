"use client";

import { useEffect } from "react";

const LS_KEY =
  process.env.NEXT_PUBLIC_LS_KEY || "affiliate_register_wizard_v1";

function clearWizard() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(LS_KEY);
  localStorage.removeItem("affiliate_register_id");
  localStorage.removeItem("undefined");

  Object.keys(localStorage).forEach((k) => {
    if (
      k.startsWith("affiliate_register_") ||
      k.startsWith("affiliate_registerWizard")
    ) {
      localStorage.removeItem(k);
    }
  });
}

export default function SuccessClearStorage() {
  useEffect(() => {
    clearWizard();
  }, []);

  return null;
}