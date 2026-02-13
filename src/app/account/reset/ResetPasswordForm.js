"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

function Field({ label, error, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export default function ResetPasswordForm({ code }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { password: "", confirm: "" },
    mode: "onChange",
  });

  const passwordVal = watch("password");

  async function onSubmit(values) {
    const c = String(code || "").trim();
    if (!c) {
      toast({
        title: "Reset link invalid",
        description: "This reset link is missing or expired.",
        variant: "destructive",
      });
      router.replace("/account/login?msg=" + encodeURIComponent("Reset link is expired. Please request a new one."));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/account/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          code: c,
          password: String(values.password || ""),
          confirm: String(values.confirm || ""),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        toast({
          title: "Unable to reset password",
          description: data?.message || "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password updated",
        description: "Redirecting to login...",
      });

      // ✅ Same as PHP: go to login with success message
      router.replace(
        "/account/login?success=" +
          encodeURIComponent("Success: Your password has been successfully updated.")
      );
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
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription className="mt-2">
              Enter the new password you wish to use.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Field label="Password" error={errors.password?.message}>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  {...register("password", {
                    required: "Password is required",
                    validate: (v) => {
                      const s = String(v || "");
                      if (s.length < 5 || s.length > 20) {
                        return "Password must be between 5 and 20 characters!";
                      }
                      return true;
                    },
                  })}
                  className={errors.password ? "border-red-500 focus-visible:ring-red-500/30" : ""}
                />
              </Field>

              <Field label="Confirm" error={errors.confirm?.message}>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  {...register("confirm", {
                    required: "Confirm password is required",
                    validate: (v) => {
                      if (String(v || "") !== String(passwordVal || "")) {
                        return "Password and password confirmation do not match!";
                      }
                      return true;
                    },
                  })}
                  className={errors.confirm ? "border-red-500 focus-visible:ring-red-500/30" : ""}
                />
              </Field>

              <Button type="submit" className="w-full mb-3" disabled={loading}>
                {loading ? "Saving..." : "Save Password"}
              </Button>

              <div className="text-xs text-muted-foreground">
                After saving, you can login using your new password.
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
                <h2 className="text-4xl font-bold leading-tight">Secure reset.</h2>
                <p className="max-w-sm text-white/85">
                  Choose a strong password to protect your account.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur text-sm text-white/90">
              Tip: Use 8+ characters with letters and numbers.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}