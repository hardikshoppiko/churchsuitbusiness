"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useToast } from "@/components/ui/use-toast";

function isValidLogin(v) {
  const s = String(v || "").trim();
  if (!s) return false;

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  const digits = s.replace(/\D/g, "");
  const isPhone = /^\d{10,15}$/.test(digits); // ✅ mobile
  return isEmail || isPhone;
}

export default function ForgotPasswordForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { login: "" },
    mode: "onChange",
  });

  async function onSubmit(values) {
    setLoading(true);

    try {
      // ✅ API already supports: email | username | login
      const res = await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ login: String(values.login || "").trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast({
          title: "Something went wrong",
          description: data?.message || "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Check your email",
        description: "If an account exists, you'll receive a password reset link shortly.",
      });
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
    <Card className="py-0 overflow-hidden rounded-3xl border bg-background shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* LEFT */}
        <div className="p-6 sm:p-10">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl">Forgot your password?</CardTitle>
            <CardDescription className="mt-2">
              Enter your email or mobile number and we’ll send a reset link.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login">Email or Mobile</Label>
                <Input
                  id="login"
                  placeholder="you@example.com or 10 digit mobile"
                  autoComplete="username"
                  {...register("login", {
                    required: "Email or Mobile is required",
                    validate: (v) => isValidLogin(v) || "Enter a valid email or mobile number",
                  })}
                  className={errors.login ? "border-red-500 focus-visible:ring-red-500/30" : ""}
                />
                {errors.login ? (
                  <p className="text-sm text-red-600">{errors.login.message}</p>
                ) : null}
              </div>

              <Button type="submit" className="w-full mb-3" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="flex items-center justify-between gap-3 text-sm relative z-10">
                <Link
                  href="/account/login"
                  className="text-muted-foreground hover:text-foreground text-decoration-none"
                >
                  Back to login
                </Link>

                <Link
                  href="/register"
                  className="text-muted-foreground hover:text-foreground text-decoration-none inline-block"
                >
                  Register
                </Link>
              </div>

              <div className="text-xs text-muted-foreground">
                For security, we won't confirm whether an account exists.
              </div>
            </form>
          </CardContent>
        </div>

        {/* RIGHT */}
        <div className="relative hidden md:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2B7A] via-[#225ED7] to-[#4F8BFF]" />
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -top-28 -right-28 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-10 text-white">
            <div className="space-y-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                Account Security
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-bold leading-tight">Reset securely.</h2>
                <p className="max-w-sm text-white/85">
                  We'll email you a secure reset link so you can set a new password.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur text-sm text-white/90">
              Tip: Check your spam/junk folder if you don’t see the email within a few minutes.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}