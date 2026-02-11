"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/db-utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useToast } from "@/components/ui/use-toast";

function WarningBar({ show }) {
  if (!show) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      Warning: Please check form carefully for errors!
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {required ? <span className="text-red-500">*</span> : null} {label}
      </Label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function inputErrClass(hasError) {
  return hasError
    ? "border-red-400 focus-visible:ring-red-200"
    : "border-input";
}

export default function ProfileForm({ initialData }) {
  const [serverMsg, setServerMsg] = useState(null);
  const [serverErr, setServerErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const affiliate = initialData?.affiliate || null;

  const defaults = useMemo(() => {
    return {
      firstname: affiliate?.firstname || "",
      lastname: affiliate?.lastname || "",
      email: affiliate?.email || "",
      telephone: affiliate?.telephone || "",
      store_name: affiliate?.store_name || "",
      password: "",
      confirm: "",
    };
  }, [affiliate]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaults,
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
  });

  // keep autofill when server sends updated profile
  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const passwordVal = watch("password");
  const confirmVal = watch("confirm");

  // If user changes password/confirm, validate both live
  useEffect(() => {
    if (passwordVal || confirmVal) {
      trigger(["password", "confirm"]);
    }
  }, [passwordVal, confirmVal, trigger]);

  const hasAnyError = Object.keys(errors || {}).length > 0;

  async function reloadProfile() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.APP_URL}/api/affiliate/profile`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data?.ok && data?.affiliate) {
        reset({
          firstname: data.affiliate.firstname || "",
          lastname: data.affiliate.lastname || "",
          email: data.affiliate.email || "",
          telephone: data.affiliate.telephone || "",
          store_name: data.affiliate.store_name || "",
          password: "",
          confirm: "",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values) {
    setServerMsg(null);
    setServerErr(null);

    try {
      const res = await fetch("/api/affiliate/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(values),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        const msg = data?.message || "Failed to update profile.";
        setServerErr(msg);

        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });

        return;
      }

      const msg = data?.message || "Profile updated successfully.";
      setServerMsg(msg);

      toast({
        title: "Profile updated",
        description: msg
      });

      await reloadProfile();
    } catch {
      const msg = "Failed to update profile. Please try again.";
      setServerErr(msg);

      toast({
        title: "Error",
        description: msg,
        variant: "destructive"
      });
    }
  }

  if (!initialData?.ok) {
    return (
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Update your affiliate details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {initialData?.message || "Unauthorized"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>
          Keep your information up to date. Password fields are optional.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <WarningBar show={hasAnyError} />

        {/* {serverErr ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {serverErr}
          </div>
        ) : null}

        {serverMsg ? (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {serverMsg}
          </div>
        ) : null} */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <Field label="Store Name" required error={errors.store_name?.message}>
            <Input
              {...register("store_name", {
                required: "Store name is required",
                minLength: { value: 2, message: "Store name must be between 2 and 64 characters" },
                maxLength: { value: 64, message: "Store name must be between 2 and 64 characters" },
              })}
              className={cn(inputErrClass(!!errors.store_name))}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First Name" required error={errors.firstname?.message}>
              <Input
                {...register("firstname", {
                  required: "First Name must be between 1 and 32 characters!",
                  minLength: { value: 1, message: "First Name must be between 1 and 32 characters!" },
                  maxLength: { value: 32, message: "First Name must be between 1 and 32 characters!" },
                })}
                className={cn(inputErrClass(!!errors.firstname))}
              />
            </Field>

            <Field label="Last Name" required error={errors.lastname?.message}>
              <Input
                {...register("lastname", {
                  required: "Last Name must be between 1 and 32 characters!",
                  minLength: { value: 1, message: "Last Name must be between 1 and 32 characters!" },
                  maxLength: { value: 32, message: "Last Name must be between 1 and 32 characters!" },
                })}
                className={cn(inputErrClass(!!errors.lastname))}
              />
            </Field>
          </div>

          <Field label="E-Mail" required error={errors.email?.message}>
            <Input
              type="email"
              {...register("email", {
                required: "E-Mail Address does not appear to be valid!",
                validate: (v) =>
                  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim()) ||
                  "E-Mail Address does not appear to be valid!",
              })}
              className={cn(inputErrClass(!!errors.email))}
            />
          </Field>

          <Field label="Mobile" required error={errors.telephone?.message}>
            <Input
              inputMode="numeric"
              placeholder="10 digit mobile number"
              {...register("telephone", {
                required: "Mobile must be maximum 10 digit & must be numeric!",
                validate: (v) =>
                  /^\d{10}$/.test(String(v || "")) ||
                  "Mobile must be maximum 10 digit & must be numeric!",
              })}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
              }}
              className={cn(inputErrClass(!!errors.telephone))}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Password" required={false} error={errors.password?.message}>
              <Input
                type="password"
                placeholder="(leave blank to keep same)"
                {...register("password", {
                  validate: (v) => {
                    const val = String(v || "");
                    if (!val) return true;
                    if (val.length < 6 || val.length > 20) return "Password must be between 6 and 20 characters";
                    return true;
                  },
                })}
                className={cn(inputErrClass(!!errors.password))}
              />
            </Field>

            <Field label="Password Confirm" required={false} error={errors.confirm?.message}>
              <Input
                type="password"
                placeholder="Re-enter password"
                {...register("confirm", {
                  validate: (v) => {
                    const p = String(passwordVal || "");
                    const c = String(v || "");
                    if (!p && !c) return true;
                    if (!p || !c) return "Passwords do not match";
                    if (p !== c) return "Passwords do not match";
                    return true;
                  },
                })}
                className={cn(inputErrClass(!!errors.confirm))}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}