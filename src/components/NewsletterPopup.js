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

const COOKIE_NAME =
  process.env.NEXT_PUBLIC_POPUP_COOKIE_NAME || "csb_newsletter_popup";
const COOKIE_DAYS =
  parseInt(process.env.NEXT_PUBLIC_POPUP_COOKIE_DAYS || 7, 10) || 7;
const POPUP_DELAY_MS =
  parseInt(process.env.NEXT_PUBLIC_POPUP_DELAY_MS || 2500, 10) || 2500;

function getCookie(name) {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : "";
}

function setCookie(name, value, days) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
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
    setCookie(COOKIE_NAME, reason, COOKIE_DAYS);
  }

  function closePopup(reason = "close") {
    markPopupSeen(reason);
    setAnimateIn(false);
    setTimeout(() => setOpen(false), 180);
  }

  useEffect(() => {
    const seen = getCookie(COOKIE_NAME);

    if (!seen) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, POPUP_DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setAnimateIn(true), 20);
    return () => clearTimeout(timer);
  }, [open]);

  function onOpenChange(next) {
    if (!open && next) {
      setAnimateIn(false);
      setOpen(true);
      return;
    }

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

      markPopupSeen(data?.already ? "already" : "success");

      toast({
        title: data?.already ? "Already subscribed" : "You're subscribed!",
        description: data?.already
          ? "This email is already on our list."
          : "We'll send onboarding details shortly.",
      });

      reset(defaults);

      setAnimateIn(false);
      setTimeout(() => setOpen(false), 180);
    } catch (error) {
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
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className={[
          "w-[95vw] max-w-4xl p-0 overflow-hidden rounded-[26px] border-0",
          "[&>button]:hidden",
          "left-1/2 top-1/2 -translate-x-1/2",
          "transition-all duration-300 ease-out",
          animateIn
            ? "opacity-100 scale-100 -translate-y-1/2"
            : "opacity-0 scale-[0.98] -translate-y-[46%]",
        ].join(" ")}
      >
        <VisuallyHidden>
          <DialogTitle>Affiliate program signup</DialogTitle>
        </VisuallyHidden>

        <Card className="w-full overflow-hidden rounded-[26px] border-0 bg-white p-0 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT IMAGE */}
            <div className="relative hidden h-full w-full overflow-hidden md:block">
              <div
                className="absolute inset-0 h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: "url(/assets/images/newsletter-popup.png)",
                }}
              />

              {/* <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" /> */}

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-black/60 p-3 backdrop-blur-md">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                  Fashion Affiliate
                </div>

                <div className="mt-2 text-sm leading-6 text-white">
                  Launch your own affiliate store and earn commissions selling
                  premium church fashion online.
                </div>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="relative bg-[linear-gradient(180deg,#fffaff_0%,#ffffff_100%)] p-6 sm:p-7">
              {/* CUSTOM CLOSE BUTTON */}
              <button
                type="button"
                onClick={() => closePopup("close")}
                disabled={loading}
                aria-label="Close popup"
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ead7fb] bg-white text-[#7d48c8] shadow-sm transition hover:bg-[#faf5ff] disabled:opacity-60"
              >
                <span className="text-lg leading-none">×</span>
              </button>

              <div className="pr-8">
                <div className="inline-flex items-center rounded-full border border-[#ead7fb] bg-[#f5eaff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b5cc7]">
                  Affiliate Program
                </div>

                <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-[28px]">
                  Start Your Affiliate Store
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Promote premium church fashion online while we handle
                  inventory, packing and shipping.
                </p>

                <div className="mt-4 grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#7d48c8]" />
                    Free store setup
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#7d48c8]" />
                    Earn commissions per order
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#7d48c8]" />
                    Marketing tools included
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  Enter your email and mobile number to receive onboarding
                  details.
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-slate-800">
                    Email Address
                  </Label>
                  <Input
                    placeholder="Your Email"
                    autoComplete="email"
                    {...register("email", {
                      required: "Email is required",
                      validate: (v) => isValidEmail(v) || "Enter a valid email",
                    })}
                    className={[
                      "h-10 rounded-lg border-[#e8d9fb] bg-white",
                      errors.email
                        ? "border-red-500 focus-visible:ring-red-500/30"
                        : "focus-visible:ring-[#7d48c8]/20",
                    ].join(" ")}
                  />
                  {errors.email ? (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-slate-800">
                    Mobile Number
                  </Label>
                  <Input
                    placeholder="Mobile Number"
                    inputMode="numeric"
                    {...register("telephone", {
                      required: "Mobile number is required",
                      validate: (v) => {
                        const d = normalizePhone(v);
                        if (d.length < 10) {
                          return "Mobile number must be at least 10 digits";
                        }
                        if (d.length > 15) {
                          return "Mobile number must be max 15 digits";
                        }
                        return true;
                      },
                    })}
                    onInput={(e) => {
                      const d = normalizePhone(e.target.value);
                      setValue("telephone", d, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    className={[
                      "h-10 rounded-lg border-[#e8d9fb] bg-white",
                      errors.telephone
                        ? "border-red-500 focus-visible:ring-red-500/30"
                        : "focus-visible:ring-[#7d48c8]/20",
                    ].join(" ")}
                  />
                  {errors.telephone ? (
                    <p className="text-sm text-red-600">
                      {errors.telephone.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => closePopup("close")}
                    disabled={loading}
                    className="h-10 rounded-full border-[#e7d5fb] px-5 text-[#7d48c8]"
                  >
                    Close
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-10 rounded-full border-0 px-5 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #9d6ce0 0%, #7d48c8 100%)",
                    }}
                  >
                    {loading ? "Joining..." : "Join Now"}
                  </Button>
                </div>

                <p className="text-xs text-slate-500">
                  Your information stays secure with us — we never share it with
                  third parties.
                </p>
              </form>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}