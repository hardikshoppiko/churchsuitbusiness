"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

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

  const redirect = useMemo(() => searchParams.get("redirect") || "/account", [searchParams]);

  const [serverErr, setServerErr] = useState("");
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

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
          variant: "destructive"
        });

        return;
      }

      setServerMsg("Login successful. Redirecting...");

      toast({
        title: "Login successful",
        description: "Redirecting to dashboard..."
      });

      router.push(redirect);
    } catch {
      const msg = "Login failed. Please try again.";
      setServerErr(msg);

      toast({
        title: "Login failed",
        description: msg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-5xl overflow-hidden rounded-2xl border bg-background shadow-sm py-0">
      <div className="grid min-h-[560px] grid-cols-1 md:grid-cols-2">
        {/* LEFT */}
        <div className="flex items-center">
          <div className="w-full p-6 sm:p-10">
            <div className="mb-7 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Login to manage your affiliate store and subscription.
              </p>
            </div>

            {/* {serverErr ? (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="font-semibold">Login failed</div>
                <div>{serverErr}</div>
              </div>
            ) : null}

            {serverMsg ? (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <div className="font-semibold">Success</div>
                <div>{serverMsg}</div>
              </div>
            ) : null} */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Email or Mobile</Label>
                <Input
                  id="username"
                  placeholder="you@example.com or 10-digit mobile"
                  autoComplete="username"
                  {...register("username", {
                    required: "Email or Mobile is required",
                    validate: (v) => isValidLogin(v) || "Enter a valid email or mobile number",
                  })}
                  className={errors.username ? "border-red-500 focus-visible:ring-red-500/30" : ""}
                />
                {errors.username ? (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/account/forgot-password"
                    className="text-sm text-muted-foreground text-decoration-none hover:text-foreground"
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
                  className={errors.password ? "border-red-500 focus-visible:ring-red-500/30" : ""}
                />
                {errors.password ? (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                ) : null}
              </div>

              {/* <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" className="h-4 w-4 rounded border-input me-1" {...register("remember")} />
                  Remember me
                </label>
                <span className="text-xs text-muted-foreground">Secure login</span>
              </div> */}

              <Button className="w-full mb-3" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="flex items-center gap-3 pt-1">
                <div className="h-px flex-1 bg-border" />
                <div className="text-xs text-muted-foreground">New here?</div>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/register" className="text-decoration-none text-dark">Create an account</Link>
              </Button>
            </form>
          </div>
        </div>

        {/* RIGHT (THIS IS NOW A TRUE CARD-HALF PANEL) */}
        <div className="relative hidden md:flex">
          {/* background fills the entire half */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2B7A] via-[#225ED7] to-[#4F8BFF]" />

          {/* soft glows */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -top-28 -right-28 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
          </div>

          {/* content (padding only here, NOT on container) */}
          <div className="relative z-10 flex w-full flex-col justify-between p-10 text-white">
            <div className="space-y-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                Church Suit Business
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-bold leading-tight">Welcome back.</h2>
                <p className="max-w-sm text-white/85">
                  Manage your store, subscription, and orders in one place.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <div className="text-sm font-semibold">Why sign in?</div>
                <ul className="mt-3 space-y-2 text-sm text-white/90">
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/90" />
                    View your affiliate dashboard
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/90" />
                    Manage billing & subscription
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/90" />
                    Track your store progress
                  </li>
                </ul>
              </div>

              <div className="text-xs text-white/80">
                By continuing, you agree to our Terms &amp; Privacy Policy.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}