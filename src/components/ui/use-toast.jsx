"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

/**
 * ✅ Toast positions supported
 * - "top-right" (default)
 * - "top-left"
 * - "top-center"
 * - "bottom-right"
 * - "bottom-left"
 * - "bottom-center"
 *
 * Usage:
 * const { toast, setPosition } = useToast();
 *
 * setPosition("bottom-center");
 *
 * toast({ title: "Saved", description: "Card updated", variant: "success" });
 * toast({ title: "Error", description: "Unauthorized", variant: "destructive" });
 *
 * // per-toast override:
 * toast({ title:"...", position:"bottom-center" })
 */

function uid() {
  return (globalThis?.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`).toString();
}

function getContainerClasses(pos) {
  // wrapper: fixed inset + alignment
  switch (pos) {
    case "top-left":
      return "fixed inset-x-0 top-4 z-[9999] flex justify-start px-4";
    case "top-center":
      return "fixed inset-x-0 top-4 z-[9999] flex justify-center px-4";
    case "bottom-left":
      return "fixed inset-x-0 bottom-4 z-[9999] flex justify-start px-4";
    case "bottom-right":
      return "fixed inset-x-0 bottom-4 z-[9999] flex justify-end px-4";
    case "bottom-center":
      return "fixed inset-x-0 bottom-4 z-[9999] flex justify-center px-4";
    case "top-right":
    default:
      return "fixed inset-x-0 top-4 z-[9999] flex justify-end px-4";
  }
}

function isBottom(pos) {
  return String(pos || "").startsWith("bottom");
}

function getEnterAnim(pos) {
  // entering: slide from top/bottom + fade
  return isBottom(pos)
    ? "animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
    : "animate-in fade-in-0 slide-in-from-top-2 duration-200";
}

function getExitAnim(pos) {
  // exiting: slide down (for top) OR slide down (for bottom) + fade out
  // You asked specifically: fade out + slide-down.
  // We'll do slide-to-bottom for both (looks consistent).
  return "animate-out fade-out-0 slide-out-to-bottom-2 duration-200";
}

export function ToastProvider({
  children,
  /** default position if you don't pass position in toast() */
  defaultPosition = "top-right",
  /** max visible stack */
  limit = 3,
}) {
  const [position, setPosition] = useState(defaultPosition);
  const [toasts, setToasts] = useState([]);

  const timersRef = useRef(new Map()); // id -> { closeTimer, removeTimer }

  const clearTimers = useCallback((id) => {
    const t = timersRef.current.get(id);
    if (t?.closeTimer) clearTimeout(t.closeTimer);
    if (t?.removeTimer) clearTimeout(t.removeTimer);
    timersRef.current.delete(id);
  }, []);

  const removeToast = useCallback(
    (id) => {
      clearTimers(id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [clearTimers]
  );

  const closeToast = useCallback(
    (id) => {
      // mark closing so exit animation plays
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, _closing: true } : t))
      );

      // remove after animation duration (200ms)
      clearTimers(id);
      const removeTimer = setTimeout(() => removeToast(id), 220);

      timersRef.current.set(id, { removeTimer });
    },
    [clearTimers, removeToast]
  );

  const toast = useCallback(
    (t) => {
      const id = uid();

      const pos = String(t?.position || position || "top-right");

      const payload = {
        id,
        title: String(t?.title || ""),
        description: t?.description ? String(t.description) : "",
        variant: t?.variant === "destructive" ? "destructive" : "success",
        duration: Number.isFinite(Number(t?.duration)) ? Number(t.duration) : 3500,
        position: pos,
        _closing: false,
      };

      setToasts((prev) => {
        const next = [...prev, payload];
        // limit stack (remove oldest)
        if (next.length > limit) next.splice(0, next.length - limit);
        return next;
      });

      // auto close -> triggers exit animation, then remove
      const closeTimer = setTimeout(() => closeToast(id), payload.duration);
      timersRef.current.set(id, { closeTimer });

      return id;
    },
    [position, limit, closeToast]
  );

  // cleanup on unmount
  useEffect(() => {
    return () => {
      for (const [id, timers] of timersRef.current.entries()) {
        if (timers.closeTimer) clearTimeout(timers.closeTimer);
        if (timers.removeTimer) clearTimeout(timers.removeTimer);
        timersRef.current.delete(id);
      }
    };
  }, []);

  const value = useMemo(() => ({ toast, closeToast, removeToast, setPosition, position }), [
    toast,
    closeToast,
    removeToast,
    setPosition,
    position,
  ]);

  // We support per-toast position, so we need to render groups by position
  const groups = useMemo(() => {
    const map = new Map();
    for (const t of toasts) {
      const key = t.position || "top-right";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }
    return Array.from(map.entries()); // [ [pos, toasts[]], ... ]
  }, [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {groups.map(([pos, list]) => (
        <div key={pos} className={getContainerClasses(pos)}>
          <div className="w-full max-w-md space-y-2">
            {list.map((t) => {
              const isDanger = t.variant === "destructive";
              const anim = t._closing ? getExitAnim(pos) : getEnterAnim(pos);

              return (
                <div
                  key={t.id}
                  role="status"
                  aria-live="polite"
                  className={[
                    "w-full rounded-2xl border p-4 shadow-lg",
                    isDanger
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-green-200 bg-green-50 text-green-700",
                    anim,
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold leading-5">
                        {t.title || (isDanger ? "Error" : "Success")}
                      </div>
                      {t.description ? (
                        <div className="mt-1 text-sm opacity-90 break-words">
                          {t.description}
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => closeToast(t.id)}
                      className={[
                        "shrink-0 rounded-md p-1",
                        "opacity-70 hover:opacity-100",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      ].join(" ")}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: () => "",
      closeToast: () => {},
      removeToast: () => {},
      setPosition: () => {},
      position: "top-right",
    };
  }
  return ctx;
}