"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

const COOKIE_NAME = process.env.NEXT_PUBLIC_POPUP_COOKIE_NAME || "csb_newsletter_popup";
const COOKIE_DAYS = parseInt(process.env.NEXT_PUBLIC_POPUP_COOKIE_DAYS || 7) || 7;

// Delay popup 2–3 seconds (not more than that)
const POPUP_DELAY_MS = parseInt(process.env.NEXT_PUBLIC_POPUP_DELAY_MS || 2500) || 2500;

function getCookie(name) {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : "";
}

function setCookie(name, value, days) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function isValidEmail(v) {
  const s = String(v || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

function normalizePhone(v) {
  return String(v || "").replace(/\D/g, "").slice(0, 15);
}

export default function NewsletterPopup() {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // premium entry animation state
  const [animateIn, setAnimateIn] = useState(false);

  const defaults = useMemo(() => ({ email: "", telephone: "" }), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: defaults,
    mode: "onChange",
  });

  function markPopupSeen(reason = "close") {
    // ✅ cookie saved ONLY on close button OR success
    setCookie(COOKIE_NAME, reason, COOKIE_DAYS);
  }

  useEffect(() => {
    const seen = getCookie(COOKIE_NAME);

    if (!seen) {
      const t = setTimeout(() => {
        setOpen(true);
      }, POPUP_DELAY_MS);

      return () => clearTimeout(t);
    }
  }, []);

  // Trigger animation after open (premium entry)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setAnimateIn(true), 20);
    return () => clearTimeout(t);
  }, [open]);

  /**
   * ✅ IMPORTANT CHANGE:
   * Do NOT save cookie here.
   * Also do NOT allow closing through ESC/outside/X.
   * We will only close from:
   * - Close button
   * - Success submit
   */
  function onOpenChange(next) {
    // Allow opening normally
    if (!open && next) {
      setAnimateIn(false);
      setOpen(true);
      return;
    }

    // Block closing from overlay/ESC/X etc.
    // (Close will only happen via our button or submit)
    if (open && !next) {
      return;
    }
  }

  async function onSubmit(values) {
    setLoading(true);

    try {
      const payload = {
        email: String(values.email || "").trim(),
        telephone: normalizePhone(values.telephone),
        source_url: typeof window !== "undefined" ? window.location.href : "",
      };

      const res = await fetch("/api/affiliate/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        toast({
          title: "Subscription failed",
          description: data?.message || "Please try again.",
          variant: "destructive",
        });
        return;
      }

      // ✅ cookie saved ONLY on success
      markPopupSeen(data?.already ? "already" : "success");

      toast({
        title: data?.already ? "Already subscribed" : "You're subscribed!",
        description: data?.already
          ? "This email is already on our list."
          : "We'll send onboarding details shortly.",
      });

      reset(defaults);

      // ✅ close programmatically
      setAnimateIn(false);
      setTimeout(() => setOpen(false), 180);
    } catch {
      toast({
        title: "Network error",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // ✅ stop closing by ESC/outside click
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}

        className={[
          "w-[95vw] max-w-4xl",
          "p-0 overflow-hidden rounded-2xl border-0",
          "max-h-[90vh]",

          // ✅ premium animation (keeps center stable)
          "transition-all duration-200 ease-out",
          animateIn ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]",
        ].join(" ")}
      >
        <VisuallyHidden>
          <DialogTitle>Affiliate program signup</DialogTitle>
        </VisuallyHidden>

        <Card className="border-0 rounded-2xl overflow-hidden w-full py-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT IMAGE */}
            <div className="relative hidden md:block">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url(/assets/images/newsletter-popup.png)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0" />
            </div>

            {/* RIGHT FORM */}
            <div className="p-4 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="space-y-3">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                  Affiliate Program
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                  Start Your Affiliate Store &amp; Earn Commissions
                </h2>

                <p className="text-sm text-muted-foreground">
                  Promote premium church fashion. We handle products &amp; shipping — you earn on every sale.
                </p>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="mt-[6px] h-2 w-2 rounded-full bg-black" />
                    <span>
                      <span className="font-semibold">Free setup</span> in minutes
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-[6px] h-2 w-2 rounded-full bg-black" />
                    <span>
                      <span className="font-semibold">Earn commissions</span> per order
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-[6px] h-2 w-2 rounded-full bg-black" />
                    <span>
                      <span className="font-semibold">Marketing tools</span> included
                    </span>
                  </div>
                </div>

                <div className="text-sm font-semibold text-primary">
                  Enter Email + Mobile to receive onboarding details.
                </div>

                <div className="text-xs text-muted-foreground">
                  No spam. Only affiliate updates.
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    placeholder="Your Email Address"
                    autoComplete="email"
                    {...register("email", {
                      required: "Email is required",
                      validate: (v) => isValidEmail(v) || "Enter a valid email",
                    })}
                    className={errors.email ? "border-red-500 focus-visible:ring-red-500/30" : ""}
                  />
                  {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    placeholder="Your Mobile Number (For Account Support)"
                    inputMode="numeric"
                    {...register("telephone", {
                      required: "Mobile number is required",
                      validate: (v) => {
                        const d = normalizePhone(v);
                        if (d.length < 10) return "Mobile number must be at least 10 digits";
                        if (d.length > 15) return "Mobile number must be max 15 digits";
                        return true;
                      },
                    })}
                    onInput={(e) => {
                      const d = normalizePhone(e.target.value);
                      setValue("telephone", d, { shouldValidate: true, shouldDirty: true });
                    }}
                    className={errors.telephone ? "border-red-500 focus-visible:ring-red-500/30" : ""}
                  />
                  {errors.telephone ? <p className="text-sm text-red-600">{errors.telephone.message}</p> : null}
                </div>

                {/* ✅ Close LEFT, Join Now RIGHT */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // ✅ cookie saved ONLY on close button click
                      markPopupSeen("close");
                      setAnimateIn(false);
                      setTimeout(() => setOpen(false), 180);
                    }}
                    disabled={loading}
                  >
                    Close
                  </Button>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Joining..." : "Join Now"}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">Your information stays secure with us — we never share it with third parties.</p>
              </form>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}