"use client";

import { useEffect, useState } from "react";
import BSModal from "./BSModal";
import { registerModalHandler } from "@/lib/modal";

export default function GlobalModal() {
  const [modal, setModal] = useState({
    show: false,
    title: "",
    size: "md",
    showHeader: true,
    showFooter: false,
    content: null,
  });

  // Register controller
  useEffect(() => {
    registerModalHandler(setModal);
  }, []);

  return (
    <BSModal
      show={modal.show}
      onClose={() => setModal((p) => ({ ...p, show: false }))}
      title={modal.title}
      size={modal.size || "md"}
      showHeader={modal.showHeader ?? true}
      showFooter={modal.showFooter ?? false}
    >
      {modal.content}
    </BSModal>
  );
}