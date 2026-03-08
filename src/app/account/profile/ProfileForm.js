"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/db-utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useToast } from "@/components/ui/use-toast";

import styles from "./ProfileForm.module.css";

function WarningBar({ show }) {
  if (!show) return null;

  return (
    <div className={styles.warningBar}>
      Warning: Please check form carefully for errors!
    </div>
  );
}

function Field({ label, required, error, children, hint }) {
  return (
    <div className={styles.fieldWrap}>
      <div className={styles.fieldHead}>
        <Label className={styles.fieldLabel}>
          {required ? <span className={styles.requiredMark}>*</span> : null} {label}
        </Label>
        {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
      </div>

      {children}

      {error ? <p className={styles.fieldError}>{error}</p> : null}
    </div>
  );
}

function inputErrClass(hasError) {
  return hasError ? styles.inputError : "";
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

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const passwordVal = watch("password");
  const confirmVal = watch("confirm");

  useEffect(() => {
    if (passwordVal || confirmVal) {
      trigger(["password", "confirm"]);
    }
  }, [passwordVal, confirmVal, trigger]);

  const hasAnyError = Object.keys(errors || {}).length > 0;

  async function reloadProfile() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/affiliate/profile`, {
        cache: "no-store",
      });
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
        description: msg,
      });

      await reloadProfile();
    } catch {
      const msg = "Failed to update profile. Please try again.";
      setServerErr(msg);

      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
  }

  if (!initialData?.ok) {
    return (
      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <h2 className={styles.cardTitle}>My Profile</h2>
          <p className={styles.cardDesc}>Update your affiliate details.</p>
        </div>

        <div className={styles.formCardBody}>
          <div className={styles.errorBox}>
            {initialData?.message || "Unauthorized"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.formCardHeader}>
        <h2 className={styles.cardTitle}>Account Details</h2>
        <p className={styles.cardDesc}>
          Keep your information up to date. Password fields are optional.
        </p>
      </div>

      <div className={styles.formCardBody}>
        <WarningBar show={hasAnyError} />

        {serverErr ? <div className={styles.errorBox}>{serverErr}</div> : null}
        {serverMsg ? <div className={styles.successBox}>{serverMsg}</div> : null}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>Store Information</div>

            <Field label="Store Name" required error={errors.store_name?.message}>
              <Input
                {...register("store_name", {
                  required: "Store name is required",
                  minLength: {
                    value: 2,
                    message: "Store name must be between 2 and 64 characters",
                  },
                  maxLength: {
                    value: 64,
                    message: "Store name must be between 2 and 64 characters",
                  },
                })}
                className={cn(styles.inputBase, inputErrClass(!!errors.store_name))}
              />
            </Field>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>Personal Information</div>

            <div className={styles.twoColGrid}>
              <Field label="First Name" required error={errors.firstname?.message}>
                <Input
                  {...register("firstname", {
                    required: "First Name must be between 1 and 32 characters!",
                    minLength: {
                      value: 1,
                      message: "First Name must be between 1 and 32 characters!",
                    },
                    maxLength: {
                      value: 32,
                      message: "First Name must be between 1 and 32 characters!",
                    },
                  })}
                  className={cn(styles.inputBase, inputErrClass(!!errors.firstname))}
                />
              </Field>

              <Field label="Last Name" required error={errors.lastname?.message}>
                <Input
                  {...register("lastname", {
                    required: "Last Name must be between 1 and 32 characters!",
                    minLength: {
                      value: 1,
                      message: "Last Name must be between 1 and 32 characters!",
                    },
                    maxLength: {
                      value: 32,
                      message: "Last Name must be between 1 and 32 characters!",
                    },
                  })}
                  className={cn(styles.inputBase, inputErrClass(!!errors.lastname))}
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
                className={cn(styles.inputBase, inputErrClass(!!errors.email))}
              />
            </Field>

            <Field label="Mobile" required error={errors.telephone?.message} hint="10 digits">
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
                className={cn(styles.inputBase, inputErrClass(!!errors.telephone))}
              />
            </Field>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>Password Update</div>
            <p className={styles.sectionDesc}>
              Leave these fields blank if you want to keep your current password.
            </p>

            <div className={styles.twoColGrid}>
              <Field label="Password" required={false} error={errors.password?.message}>
                <Input
                  type="password"
                  placeholder="(leave blank to keep same)"
                  {...register("password", {
                    validate: (v) => {
                      const val = String(v || "");
                      if (!val) return true;
                      if (val.length < 6 || val.length > 20) {
                        return "Password must be between 6 and 20 characters";
                      }
                      return true;
                    },
                  })}
                  className={cn(styles.inputBase, inputErrClass(!!errors.password))}
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
                  className={cn(styles.inputBase, inputErrClass(!!errors.confirm))}
                />
              </Field>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className={styles.primaryButton}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}