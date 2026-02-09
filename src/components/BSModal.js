"use client";

import { useEffect, useId, useRef } from "react";

export default function BSModal({
  show,
  onClose,

  title = "",
  children,
  bodyHtml = "",

  size = "md",
  scrollable = true,
  centered = false,

  showHeader = true,
  showFooter = false,

  footer = null,
  showCloseButton = true,

  // ✅ control closing behavior
  closeOnBackdrop = true, // click outside closes
  closeOnEsc = true,      // ESC closes
}) {
  const autoId = useId().replace(/:/g, "");
  const modalId = `bsmodal_${autoId}`;

  const elRef = useRef(null);
  const modalRef = useRef(null);

  // Init modal
  useEffect(() => {
    if (!elRef.current) return;

    const tryInit = () => {
      const bs = window.bootstrap;
      if (!bs) return false;

      modalRef.current = new bs.Modal(elRef.current, {
        backdrop: closeOnBackdrop ? true : "static",
        keyboard: !!closeOnEsc,
      });

      // When Bootstrap actually hides the modal, sync React state
      const handleHidden = () => onClose?.();
      elRef.current.addEventListener("hidden.bs.modal", handleHidden);

      return () => {
        elRef.current?.removeEventListener("hidden.bs.modal", handleHidden);
        modalRef.current?.dispose?.();
        modalRef.current = null;
      };
    };

    // Bootstrap script might load after component mounts
    let cleanup;
    const ok = tryInit();
    if (ok) {
      cleanup = ok;
    } else {
      const t = setInterval(() => {
        const res = tryInit();
        if (res) {
          cleanup = res;
          clearInterval(t);
        }
      }, 50);

      return () => clearInterval(t);
    }

    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [onClose, closeOnBackdrop, closeOnEsc]);

  // React -> Bootstrap show/hide
  useEffect(() => {
    if (!modalRef.current) return;

    if (show) modalRef.current.show();
    else modalRef.current.hide();
  }, [show]);

  // Close button should hide Bootstrap modal directly
  const handleClose = () => {
    if (modalRef.current) modalRef.current.hide();
    else onClose?.(); // fallback
  };

  // Size class (md is default: no modal-md)
  const sizeClass = size && size !== "md" ? `modal-${size}` : "";

  const dialogClass = [
    "modal-dialog",
    sizeClass,
    scrollable ? "modal-dialog-scrollable" : "",
    centered ? "modal-dialog-centered" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="modal fade"
      id={modalId}
      tabIndex={-1}
      aria-hidden="true"
      ref={elRef}
    >
      <div className={dialogClass}>
        <div className="modal-content">
          {/* Header */}
          {showHeader ? (
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleClose}
              />
            </div>
          ) : null}

          {/* Body */}
          <div className="modal-body">
            {children
              ? children
              : bodyHtml
              ? <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              : null}
          </div>

          {/* Footer */}
          {showFooter ? (
            <div className="modal-footer">
              {footer ? footer : null}

              {showCloseButton ? (
                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                  Close
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}