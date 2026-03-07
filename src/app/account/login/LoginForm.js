"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/db-utils";

import styles from "./LoginForm.module.css";

function isValidLogin(v) {
  const s = String(v || "").trim();
  if (!s) return false;

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  const digits = s.replace(/\D/g, "");
  const isPhone = /^\d{10,15}$/.test(digits);
  return isEmail || isPhone;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = useMemo(
    () => searchParams.get("redirect") || "/account",
    [searchParams]
  );

  const [serverErr, setServerErr] = useState("");
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const urlSuccess = useMemo(
    () => String(searchParams.get("success") || ""),
    [searchParams]
  );
  const urlMsg = useMemo(
    () => String(searchParams.get("msg") || ""),
    [searchParams]
  );

  const toastShownRef = useRef(false);

  useEffect(() => {
    if (toastShownRef.current) return;

    const success = urlSuccess.trim();
    const msg = urlMsg.trim();

    if (!success && !msg) return;

    toastShownRef.current = true;

    if (success) {
      toast({
        title: "Success",
        description: msg || "Done successfully.",
      });
    } else if (msg) {
      toast({
        title: "Notice",
        description: msg,
        variant: "destructive",
      });
    }

    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("success");
    sp.delete("msg");

    const newQuery = sp.toString();
    router.replace(newQuery ? `?${newQuery}` : "?", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSuccess, urlMsg]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      remember: true,
    },
  });

  async function onSubmit(values) {
    setServerErr("");
    setServerMsg("");
    setLoading(true);

    try {
      const res = await fetch(`/api/account/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
        body: JSON.stringify({
          username: String(values.username || "").trim(),
          password: String(values.password || ""),
          remember: !!values.remember,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || "Login failed. Please try again.";
        setServerErr(msg);

        toast({
          title: "Login failed",
          description: msg,
          variant: "destructive",
        });

        return;
      }

      setServerMsg("Login successful. Redirecting...");

      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });

      router.push(redirect);
    } catch {
      const msg = "Login failed. Please try again.";
      setServerErr(msg);

      toast({
        title: "Login failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={styles.loginCard}>
      <div className={styles.loginGrid}>
        {/* LEFT */}
        <div className={styles.formSide}>
          <div className={styles.formInner}>
            <div className={styles.headerBlock}>
              <div className={styles.eyebrow}>Affiliate Access</div>
              <h1 className={styles.title}>Welcome back</h1>
              <p className={styles.subtitle}>
                Sign in to manage your affiliate store, subscription, and account activity.
              </p>
            </div>

            {(serverErr || serverMsg) && (
              <div
                className={cn(
                  styles.alertBox,
                  serverErr ? styles.alertError : styles.alertSuccess
                )}
              >
                {serverErr || serverMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.fieldWrap}>
                <Label htmlFor="username" className={styles.label}>
                  Email or Mobile
                </Label>
                <Input
                  id="username"
                  placeholder="you@example.com or 10-digit mobile"
                  autoComplete="username"
                  {...register("username", {
                    required: "Email or Mobile is required",
                    validate: (v) =>
                      isValidLogin(v) || "Enter a valid email or mobile number",
                  })}
                  className={cn(
                    styles.inputBase,
                    errors.username ? styles.inputError : ""
                  )}
                />
                {errors.username ? (
                  <p className={styles.errorText}>{errors.username.message}</p>
                ) : null}
              </div>

              <div className={styles.fieldWrap}>
                <div className={styles.passwordRow}>
                  <Label htmlFor="password" className={styles.label}>
                    Password
                  </Label>
                  <Link
                    href="/account/forgot-password"
                    className={styles.forgotLink}
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                    maxLength: { value: 50, message: "Maximum 50 characters" },
                  })}
                  className={cn(
                    styles.inputBase,
                    errors.password ? styles.inputError : ""
                  )}
                />
                {errors.password ? (
                  <p className={styles.errorText}>{errors.password.message}</p>
                ) : null}
              </div>

              <Button className={styles.primaryBtn} type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className={styles.dividerRow}>
                <div className={styles.dividerLine} />
                <div className={styles.dividerText}>New here?</div>
                <div className={styles.dividerLine} />
              </div>

              <Button variant="outline" className={styles.secondaryBtn} asChild>
                <Link href="/register" className="text-decoration-none">Create New Account</Link>
              </Button>
            </form>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.visualSide}>
          <div className={styles.visualBg} />
          <div className={styles.visualGlowWrap}>
            <div className={styles.visualGlowTop} />
            <div className={styles.visualGlowBottom} />
          </div>

          <div className={styles.visualContent}>
            <div className={styles.visualTop}>
              <div className={styles.visualBadge}>Church Suit Business</div>

              <div className={styles.visualHeadingWrap}>
                <h2 className={styles.visualTitle}>Sign in to your premium affiliate dashboard.</h2>
                <p className={styles.visualText}>
                  Access your store tools, billing details, and account progress in one place.
                </p>
              </div>
            </div>

            <div className={styles.visualBottom}>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>Why sign in?</div>
                <ul className={styles.featureList}>
                  <li className={styles.featureItem}>
                    <span className={styles.featureDot} />
                    View your affiliate dashboard
                  </li>
                  <li className={styles.featureItem}>
                    <span className={styles.featureDot} />
                    Manage billing & subscription
                  </li>
                  <li className={styles.featureItem}>
                    <span className={styles.featureDot} />
                    Track your store progress
                  </li>
                </ul>
              </div>

              <div className={styles.legalText}>
                By continuing, you agree to our Terms &amp; Privacy Policy.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}