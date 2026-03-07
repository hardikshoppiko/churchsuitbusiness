"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import styles from "./ForgotPasswordForm.module.css";

function isValidLogin(v) {
  const s = String(v || "").trim();
  if (!s) return false;

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  const digits = s.replace(/\D/g, "");
  const isPhone = /^\d{10,15}$/.test(digits);

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
        description:
          "If an account exists, you'll receive a password reset link shortly.",
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
    <Card className={`${styles.card} p-0`}>
      <div className={styles.grid}>
        {/* LEFT SIDE */}
        <div className={styles.formSide}>
          <div className={styles.header}>
            <div className={styles.badge}>Account Recovery</div>

            <h1 className={styles.title}>Forgot your password?</h1>

            <p className={styles.subtitle}>
              Enter your email or mobile number and we'll send a secure reset
              link.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.field}>
              <Label>Email or Mobile</Label>

              <Input
                placeholder="you@example.com or 10 digit mobile"
                autoComplete="username"
                {...register("login", {
                  required: "Email or Mobile is required",
                  validate: (v) =>
                    isValidLogin(v) || "Enter a valid email or mobile number",
                })}
                className={errors.login ? styles.inputError : ""}
              />

              {errors.login && (
                <p className={styles.error}>{errors.login.message}</p>
              )}
            </div>

            <Button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className={styles.links}>
              <Link href="/account/login" className={styles.link}>
                Back to login
              </Link>

              <Link href="/register" className={styles.link}>
                Register
              </Link>
            </div>

            <div className={styles.note}>
              For security, we won't confirm whether an account exists.
            </div>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.visual}>
          <div className={styles.visualOverlay} />

          <div className={styles.visualContent}>
            <div className={styles.visualTop}>
              <div className={styles.visualBadge}>Account Security</div>

              <h2 className={styles.visualTitle}>Reset securely.</h2>

              <p className={styles.visualText}>
                We'll email you a secure password reset link so you can regain
                access to your account safely.
              </p>
            </div>

            <div className={styles.tip}>
              Tip: Check your spam folder if you don't see the email within a
              few minutes.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}