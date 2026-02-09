"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/db-utils";
import { openModal } from "@/lib/modal";
import TermsContent from "@/app/register/TermsContent";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ================================
   Helpers
================================ */
function money(amount) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(amount || 0));
  } catch {
    return `$${Number(amount || 0).toFixed(2)}`;
  }
}

function handleOpenTerms() {
  openModal({
    title: "Terms & Conditions",
    size: "lg",
    content: <TermsContent />,
  });
}

/* ================================
   LocalStorage
================================ */
const LS_KEY = process.env.LS_KEY || "affiliate_register_wizard_v1";

function safeJsonParse(v) {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function loadWizard() {
  if (typeof window === "undefined") return null;
  return safeJsonParse(localStorage.getItem(LS_KEY));
}

function saveWizard(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function clearWizard() {
  if (typeof window === "undefined") return;

  // main wizard state
  localStorage.removeItem(LS_KEY);

  // affiliate id cache
  localStorage.removeItem("affiliate_register_id");

  // IMPORTANT: you have a bad key named "undefined" (as per screenshot)
  localStorage.removeItem("undefined");

  // optional: remove any old keys you might have used earlier
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith("affiliate_register_") || k.startsWith("affiliate_registerWizard")) {
      localStorage.removeItem(k);
    }
  });
}

/* ================================
   Premium UI building blocks
================================ */
function StepPill({ active, done, number, label }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold",
          done
            ? "bg-primary text-primary-foreground border-primary"
            : active
            ? "border-primary text-primary"
            : "border-border text-muted-foreground"
        )}
      >
        {done ? "✓" : number}
      </div>
      <div className="leading-tight">
        <div className={cn("text-sm font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
          {label}
        </div>
        <div className="text-xs text-muted-foreground">
          Step {number}
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, error, hint, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <Label className="text-sm font-medium">
          {required ? <span className="text-red-500">*</span> : null} {label}
        </Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function Select({ value, onChange, disabled, error, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled ? "opacity-70" : "",
        error ? "border-red-500" : "border-input"
      )}
    >
      {children}
    </select>
  );
}

function Banner({ variant = "info", title, desc }) {
  const styles =
    variant === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : variant === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : "border-border bg-muted/40 text-foreground";

  return (
    <div className={cn("rounded-xl border p-4", styles)}>
      {title ? <div className="font-semibold">{title}</div> : null}
      {desc ? <div className="text-sm mt-1 opacity-90">{desc}</div> : null}
    </div>
  );
}

/* ================================
   Component
================================ */
export default function RegisterWizardForm({
  plans = [],
  countries = [],
  defaultCountryId = 0,
  defaultZoneId = 0,
}) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [affiliateId, setAffiliateId] = useState(null);

  const [serverMsg, setServerMsg] = useState(null);
  const [serverErr, setServerErr] = useState(null);

  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);

  const [domainInfo, setDomainInfo] = useState(null);
  const [domainChecking, setDomainChecking] = useState(false);
  const [ownDomainChecked, setOwnDomainChecked] = useState(false);

  const [isRestored, setIsRestored] = useState(false);
  const [persistEnabled, setPersistEnabled] = useState(true);

  const defaultPlanId = useMemo(() => {
    return plans?.[0]?.affiliate_plan_id ? String(plans[0].affiliate_plan_id) : "";
  }, [plans]);

  const {
    register,
    setValue,
    getValues,
    watch,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      affiliate_plan_id: defaultPlanId,
      business_name: "",
      website: "",
      is_customer_own_domain: 0,
      is_domain_available: 0,
      is_domain_avaibility_checked: 0,

      firstname: "",
      lastname: "",
      email: "",
      telephone: "",

      address_1: "",
      address_2: "",
      city: "",
      postcode: "",
      country_id: defaultCountryId ? String(defaultCountryId) : "",
      zone_id: defaultZoneId ? String(defaultZoneId) : "",

      password: "",
      confirm: "",
      agree_terms: true,
    },
  });

  /* ---------- Restore wizard ---------- */
  useEffect(() => {
    const saved = loadWizard();
    if (!saved) {
      setIsRestored(true);
      return;
    }

    if (saved.affiliateId) setAffiliateId(saved.affiliateId);
    if (saved.step) setStep(saved.step);

    if (saved.values) {
      reset({
        ...getValues(),
        ...saved.values,
      });
    }

    setIsRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allValues = watch();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!persistEnabled) return;

    saveWizard({
      step,
      affiliateId,
      values: allValues,
      savedAt: Date.now(),
    });
  }, [allValues, step, affiliateId, persistEnabled]);

  const selectedCountryId = watch("country_id");
  const selectedPlanId = watch("affiliate_plan_id");

  /* ---------- Zones ---------- */
  async function fetchZones(country_id, keepZoneId) {
    if (!country_id) {
      setZones([]);
      setValue("zone_id", "");
      return;
    }

    setZonesLoading(true);
    try {
      const res = await fetch(`/api/geo/zones?country_id=${country_id}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      const list = Array.isArray(data?.zones) ? data.zones : [];
      setZones(list);

      if (keepZoneId) {
        const ok = list.some((z) => String(z.zone_id) === String(keepZoneId));
        if (ok) {
          setValue("zone_id", String(keepZoneId));
          return;
        }
      }

      setValue("zone_id", "");
    } finally {
      setZonesLoading(false);
    }
  }

  useEffect(() => {
    if (defaultCountryId) {
      fetchZones(String(defaultCountryId), defaultZoneId ? String(defaultZoneId) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isRestored) return;

    if (!selectedCountryId) {
      setZones([]);
      setValue("zone_id", "");
      return;
    }

    const keepZoneId = String(getValues("zone_id") || "");
    fetchZones(String(selectedCountryId), keepZoneId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryId, isRestored]);

  /* ---------- AffiliateId persistence ---------- */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("affiliate_register_id");
      if (saved && !affiliateId) setAffiliateId(Number(saved));
    } catch {}
  }, [affiliateId]);

  function saveAffiliateId(id) {
    setAffiliateId(Number(id));
    try {
      localStorage.setItem("affiliate_register_id", String(id));
    } catch {}
  }

  /* ---------- helpers ---------- */
  function getSelectedPlanInfo() {
    const pid = Number(getValues("affiliate_plan_id") || 0);
    return plans.find((p) => Number(p.affiliate_plan_id) === pid) || null;
  }

  async function checkDomainAvaibilityStatus(domainParam) {
    const website = String(domainParam ?? getValues("website") ?? "").trim();
    if (!website) return;

    setDomainChecking(true);
    setOwnDomainChecked(false);
    setDomainInfo(null);

    setValue("is_domain_avaibility_checked", 1);
    setValue("is_customer_own_domain", 0);

    try {
      const res = await fetch(`/api/affiliate/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          step: 2,
          action: "check_domain",
          domain_name: website,
        }),
      });

      const data = await res.json().catch(() => ({}));

      setValue("is_domain_available", 1);
      if (data?.error && data?.domain_not_available) {
        setValue("is_domain_available", 0);
      }
      setDomainInfo(data);
    } catch {
      setDomainInfo({ error: "Domain check failed. Please try again." });
      setValue("is_domain_available", 0);
    } finally {
      setDomainChecking(false);
    }
  }

  function chooseSuggestedDomain(d) {
    const domain = String(d || "").trim();
    if (!domain) return;

    setValue("website", domain, { shouldValidate: true, shouldDirty: true });
    setDomainInfo(null);
    checkDomainAvaibilityStatus(domain);
  }

  function onOwnDomainToggle(checked) {
    const v = !!checked;
    setOwnDomainChecked(v);
    setValue("is_domain_avaibility_checked", 1);

    if (v) {
      setValue("is_customer_own_domain", 1);
      setValue("is_domain_available", 1);
      setDomainInfo(null);
    } else {
      setValue("is_customer_own_domain", 0);
    }
  }

  async function postRegister(payload) {
    const res = await fetch(`/api/affiliate/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return { res, data };
  }

  /* ---------- Step actions ---------- */
  async function onNextStep1() {
    setServerMsg(null);
    setServerErr(null);

    const ok = await trigger(["firstname", "lastname", "email", "telephone"]);
    if (!ok) return;

    if (affiliateId && Number(affiliateId) > 0) {
      const payload = {
        step: 1,
        affiliate_id: affiliateId,
        firstname: getValues("firstname"),
        lastname: getValues("lastname"),
        email: getValues("email"),
        telephone: getValues("telephone"),
      };

      const { res, data } = await postRegister(payload);
      if (!res.ok) {
        setServerErr(data?.message || "Step 1 update failed. Please try again.");
        return;
      }

      setServerMsg("Step 1 updated successfully.");
      setStep(2);
      return;
    }

    const payload = {
      step: 1,
      firstname: getValues("firstname"),
      lastname: getValues("lastname"),
      email: getValues("email"),
      telephone: getValues("telephone"),
    };

    const { res, data } = await postRegister(payload);
    if (!res.ok || !data?.affiliate_id) {
      setServerErr(data?.message || "Step 1 failed. Please try again.");
      return;
    }

    saveAffiliateId(data.affiliate_id);
    setServerMsg("Step 1 saved successfully.");
    setStep(2);
  }

  async function onNextStep2() {
    setServerMsg(null);
    setServerErr(null);

    if (!affiliateId) {
      setServerErr("Affiliate ID missing. Please complete Step 1 again.");
      setStep(1);
      return;
    }

    const ok = await trigger(["affiliate_plan_id", "business_name", "website"]);
    if (!ok) return;

    const plan = getSelectedPlanInfo();

    const payload = {
      step: 2,
      affiliate_id: affiliateId,

      affiliate_plan_id: getValues("affiliate_plan_id"),
      affiliate_type: getValues("affiliate_plan_id"),
      store_name: getValues("business_name"),
      business_name: getValues("business_name"),

      is_customer_own_domain: Number(getValues("is_customer_own_domain") || 0),
      is_domain_available: Number(getValues("is_domain_available") || 0),
      is_domain_avaibility_checked: Number(getValues("is_domain_avaibility_checked") || 0),

      website: getValues("website") ? `https://www.${getValues("website")}` : "",

      fees: plan?.fees || 0,
      stripe_plan_id: plan?.stripe_plan_id || "",
      price_schema: plan?.price_schema || "",
      default_markup: plan?.default_markup || 0,
      retail_price_commission: plan?.retail_price_commission || 0,
      is_catalog_access: plan?.is_catalog_access || 0,

      from_email: "",
      fax: "",
      company: "",
      stripe_token: "",
      stripe_customer_id: "",
      recurring_billing: "",
      recurring_billing_id: "",
      store_category_type: 0,
      commission: 0,
      tax: "",
      payment: "",
      cheque: "",
      paypal: "",
      bank_name: "",
      bank_branch_number: "",
      bank_swift_code: "",
      bank_account_name: "",
      bank_account_number: "",
      ip: "",
      status: 0,
      newsletter: 1,
      newsletter_text: 0,
      affiliate_status_id: 1,
      approved: 0,
      stop_automation: 0,
      user_added: 0,
      user_modified: 0,
      is_delete: 0,
    };

    const { res, data } = await postRegister(payload);
    if (!res.ok) {
      setServerErr(data?.message || "Step 2 failed. Please try again.");
      return;
    }

    setServerMsg("Step 2 saved successfully.");
    setStep(3);
  }

  async function onFinishStep3() {
    setServerMsg(null);
    setServerErr(null);

    if (!affiliateId) {
      setServerErr("Affiliate ID missing. Please complete Step 1 again.");
      setStep(1);
      return;
    }

    const ok = await trigger([
      "address_1",
      "city",
      "postcode",
      "country_id",
      "zone_id",
      "password",
      "confirm",
      "agree_terms",
    ]);
    if (!ok) return;

    const payload = {
      step: 3,
      affiliate_id: affiliateId,

      address_1: getValues("address_1"),
      address_2: getValues("address_2"),
      city: getValues("city"),
      postcode: getValues("postcode"),
      country_id: getValues("country_id"),
      zone_id: getValues("zone_id"),

      password: getValues("password"),
      confirm: getValues("confirm"),
      agree_terms: getValues("agree_terms"),
    };

    const { res, data } = await postRegister(payload);
    if (!res.ok) {
      setServerErr(data?.message || "Step 3 failed. Please try again.");
      return;
    }

    setServerMsg("Registration completed. Redirecting to payment...");

    // stop autosave first (so it can't write again)
    setPersistEnabled(false);

    // clear storage keys
    clearWizard();

    // also reset state (optional but good)
    setAffiliateId(null);
    setStep(1);

    router.push(`/register/payment/${affiliateId}`);
  }

  /* ---------- derived ---------- */
  const stepTitle =
    step === 1 ? "Personal Information" : step === 2 ? "Plan & Business" : "Store Address & Password";

  const websiteValue = String(getValues("website") || "").trim();
  const domainChecked = Number(watch("is_domain_avaibility_checked") || 0) === 1;
  const domainAvailable = Number(watch("is_domain_available") || 0) === 1;
  const ownDomain = Number(watch("is_customer_own_domain") || 0) === 1;

  const canProceedStep2 =
    !!websiteValue && domainChecked && (domainAvailable || ownDomain) && !domainChecking;

  const progress = Math.round((step / 3) * 100);

  const selectedPlan = useMemo(() => {
    return plans.find((p) => String(p.affiliate_plan_id) === String(selectedPlanId)) || null;
  }, [plans, selectedPlanId]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Premium background */}
      <div className="relative overflow-hidden rounded-3xl border bg-background shadow-sm">
        <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative grid gap-0 lg:grid-cols-[360px_1fr]">
          {/* Left: steps / summary */}
          <div className="border-b p-6 lg:border-b-0 lg:border-r">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-primary">Affiliate Registration</div>
              <div className="text-2xl font-bold tracking-tight">Create your store</div>
              <p className="text-sm text-muted-foreground">
                Complete 3 quick steps to generate your affiliate website.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <StepPill number={1} label="Personal Info" active={step === 1} done={step > 1} />
              <StepPill number={2} label="Plan & Domain" active={step === 2} done={step > 2} />
              <StepPill number={3} label="Address & Password" active={step === 3} done={false} />
            </div>

            <div className="mt-6">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Progress: <span className="font-semibold text-foreground">{progress}%</span>
                {affiliateId ? (
                  <span className="ml-2">
                    • Affiliate ID: <span className="font-semibold text-foreground">{affiliateId}</span>
                  </span>
                ) : null}
              </div>
            </div>

            {selectedPlan && step >= 2 ? (
              <div className="mt-6 rounded-2xl border bg-muted/30 p-4">
                <div className="text-xs font-semibold text-muted-foreground">Selected Plan</div>
                <div className="mt-1 font-semibold">{selectedPlan.name}</div>
                <div className="text-sm text-muted-foreground">
                  {money(selectedPlan.fees)} / month
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: form */}
          <div className="p-6 lg:p-8">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl">{stepTitle}</CardTitle>
                <CardDescription>
                  Step <span className="font-semibold">{step}</span> of{" "}
                  <span className="font-semibold">3</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="px-0">
                {serverErr ? <Banner variant="error" title="Error" desc={serverErr} /> : null}
                {serverMsg ? <div className="mt-4"><Banner variant="success" title="Success" desc={serverMsg} /></div> : null}

                <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-6">
                  {/* STEP 1 */}
                  {step === 1 ? (
                    <div className="space-y-6">
                      <div className="grid gap-5 md:grid-cols-2">
                        <Field label="First Name" required error={errors.firstname?.message}>
                          <Input
                            {...register("firstname", {
                              required: "First name is required",
                              minLength: { value: 1, message: "Min 1 character" },
                              maxLength: { value: 32, message: "Max 32 characters" },
                            })}
                            className={cn(errors.firstname ? "border-red-500" : "")}
                          />
                        </Field>

                        <Field label="Last Name" required error={errors.lastname?.message}>
                          <Input
                            {...register("lastname", {
                              required: "Last name is required",
                              minLength: { value: 1, message: "Min 1 character" },
                              maxLength: { value: 32, message: "Max 32 characters" },
                            })}
                            className={cn(errors.lastname ? "border-red-500" : "")}
                          />
                        </Field>
                      </div>

                      <Field label="Email" required error={errors.email?.message}>
                        <Input
                          type="email"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                              message: "Please enter a valid email address",
                            },
                          })}
                          className={cn(errors.email ? "border-red-500" : "")}
                        />
                      </Field>

                      <Field label="Phone / Mobile" required error={errors.telephone?.message} hint="10 digits">
                        <Input
                          inputMode="numeric"
                          placeholder="10 digit mobile number"
                          {...register("telephone", {
                            required: "Phone/Mobile is required",
                            pattern: { value: /^\d{10}$/, message: "Phone/Mobile must be exactly 10 digits" },
                          })}
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                          }}
                          className={cn(errors.telephone ? "border-red-500" : "")}
                        />
                      </Field>
                    </div>
                  ) : null}

                  {/* STEP 2 */}
                  {step === 2 ? (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="text-sm font-semibold">
                          <span className="text-red-500">*</span> Select Your Plan
                        </div>

                        {plans.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No plans available right now.</p>
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2">
  {plans.map((p) => {
    const active = String(selectedPlanId) === String(p.affiliate_plan_id);

    return (
      <label
        key={p.affiliate_plan_id}
        className={cn(
          "group flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition",
          active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
        )}
      >
        {/* compact radio */}
        <input
          type="radio"
          value={String(p.affiliate_plan_id)}
          className="mt-1 h-4 w-4"
          {...register("affiliate_plan_id", {
            required: "Please select a plan",
          })}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-sm font-semibold">{p.name}</div>
            <div className="shrink-0 rounded-full border bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {money(p.fees)}/mo
            </div>
          </div>

          {p.tag_line ? (
            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {p.tag_line}
            </div>
          ) : null}
        </div>
      </label>
    );
  })}
</div>
                        )}

                        {errors.affiliate_plan_id ? (
                          <p className="text-sm text-red-600">{errors.affiliate_plan_id.message}</p>
                        ) : null}
                      </div>

                      <Separator />

                      <Field label="Business Name" required error={errors.business_name?.message}>
                        <Input
                          {...register("business_name", {
                            required: "Business name is required",
                            minLength: { value: 3, message: "Min 3 characters" },
                            maxLength: { value: 32, message: "Max 32 characters" },
                          })}
                          className={cn(errors.business_name ? "border-red-500" : "")}
                        />
                      </Field>

                      <Field label="Website Domain" error={errors.website?.message} hint="without https://www">
                        <div className="flex">
                          <div className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                            https://www.
                          </div>
                          <Input
                            className={cn("rounded-l-none", errors.website ? "border-red-500" : "")}
                            placeholder="yourdomain.com"
                            {...register("website", {
                              validate: (v) => {
                                if (!v) return true;
                                if (/\s/.test(v)) return "Website cannot contain spaces";
                                if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("www.")) {
                                  return "Do not include https:// or www";
                                }
                                return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v) || "Enter a valid domain like yourdomain.com";
                              },
                            })}
                            onBlur={() => {
                              const v = String(getValues("website") || "").trim();
                              if (!v) return;
                              const ok = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v) && !/\s/.test(v);
                              if (ok) checkDomainAvaibilityStatus(v);
                            }}
                          />
                        </div>

                        <input type="hidden" {...register("is_customer_own_domain")} />
                        <input type="hidden" {...register("is_domain_available")} />
                        <input type="hidden" {...register("is_domain_avaibility_checked")} />

                        {domainChecking ? (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Checking domain availability...
                          </div>
                        ) : null}

                        {domainInfo?.error && domainInfo?.domain_not_available ? (
                          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {domainInfo.error}
                          </div>
                        ) : null}

                        {domainInfo?.success && domainInfo?.domain_found ? (
                          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                            {domainInfo.domain_found}
                          </div>
                        ) : null}

                        {Array.isArray(domainInfo?.domain_suggestions) && domainInfo.domain_suggestions.length > 0 ? (
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <input
                                id="input-business-own-domain"
                                type="checkbox"
                                checked={ownDomainChecked}
                                onChange={(e) => onOwnDomainToggle(e.target.checked)}
                                className="h-4 w-4 rounded border-border"
                              />
                              <Label htmlFor="input-business-own-domain" className="font-semibold">
                                I already own this domain
                              </Label>
                            </div>

                            <div className="text-sm font-semibold">Suggestions</div>
                            <div className="flex flex-wrap gap-2">
                              {domainInfo.domain_suggestions.slice(0, 8).map((d) => (
                                <button
                                  type="button"
                                  key={d}
                                  onClick={() => chooseSuggestedDomain(d)}
                                  className="rounded-full border border-border bg-background px-3 py-1 text-sm hover:bg-muted"
                                >
                                  {d}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {!canProceedStep2 ? (
                          <p className="mt-3 text-sm text-muted-foreground">
                            Please check your domain availability (or confirm you own the domain) to continue.
                          </p>
                        ) : null}
                      </Field>
                    </div>
                  ) : null}

                  {/* STEP 3 */}
                  {step === 3 ? (
                    <div className="space-y-6">
                      <Field label="Address 1" required error={errors.address_1?.message}>
                        <Input
                          {...register("address_1", { required: "Address 1 is required" })}
                          className={cn(errors.address_1 ? "border-red-500" : "")}
                        />
                      </Field>

                      <Field label="Address 2" error={errors.address_2?.message}>
                        <Input {...register("address_2")} />
                      </Field>

                      <div className="grid gap-5 md:grid-cols-2">
                        <Field label="City" required error={errors.city?.message}>
                          <Input
                            {...register("city", { required: "City is required" })}
                            className={cn(errors.city ? "border-red-500" : "")}
                          />
                        </Field>

                        <Field label="Zip Code" required error={errors.postcode?.message}>
                          <Input
                            {...register("postcode", { required: "Zip code is required" })}
                            className={cn(errors.postcode ? "border-red-500" : "")}
                          />
                        </Field>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Country" required error={errors.country_id?.message}>
                          <Select
                            value={String(watch("country_id") || "")}
                            onChange={(e) =>
                              setValue("country_id", e.target.value, { shouldValidate: true })
                            }
                            error={!!errors.country_id}
                          >
                            <option value="">--- Please Select ---</option>
                            {countries.map((c) => (
                              <option key={c.country_id} value={String(c.country_id)}>
                                {c.name}
                              </option>
                            ))}
                          </Select>
                        </Field>

                        <Field label="Region / State" required error={errors.zone_id?.message}>
                          <Select
                            value={String(watch("zone_id") || "")}
                            onChange={(e) =>
                              setValue("zone_id", e.target.value, { shouldValidate: true })
                            }
                            disabled={!selectedCountryId || zonesLoading}
                            error={!!errors.zone_id}
                          >
                            <option value="">
                              {zonesLoading ? "Loading..." : "--- Please Select ---"}
                            </option>
                            {zones.map((z) => (
                              <option key={z.zone_id} value={String(z.zone_id)}>
                                {z.name}
                              </option>
                            ))}
                          </Select>

                          {!zonesLoading && selectedCountryId && zones.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No regions/states available for selected country.
                            </p>
                          ) : null}
                        </Field>
                      </div>

                      <Separator />

                      <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Password" required error={errors.password?.message}>
                          <Input
                            type="password"
                            {...register("password", {
                              required: "Password is required",
                              minLength: { value: 6, message: "Minimum 6 characters" },
                              maxLength: { value: 20, message: "Maximum 20 characters" },
                            })}
                            className={cn(errors.password ? "border-red-500" : "")}
                          />
                        </Field>

                        <Field label="Password Confirm" required error={errors.confirm?.message}>
                          <Input
                            type="password"
                            {...register("confirm", {
                              required: "Confirm password is required",
                              validate: (v) => v === getValues("password") || "Passwords do not match",
                            })}
                            className={cn(errors.confirm ? "border-red-500" : "")}
                          />
                        </Field>
                      </div>

                      <div className="rounded-2xl border bg-muted/30 p-4">
                        <div className="flex items-start gap-3">
                          <input
                            id="agree_terms"
                            type="checkbox"
                            checked={!!watch("agree_terms")}
                            onChange={(e) =>
                              setValue("agree_terms", e.target.checked, { shouldValidate: true })
                            }
                            className="mt-1 h-4 w-4 rounded border-border"
                          />
                          <div className="space-y-1">
                            <Label htmlFor="agree_terms" className="leading-5">
                              I agree to the{" "}
                              <button
                                type="button"
                                className="underline underline-offset-4"
                                onClick={handleOpenTerms}
                              >
                                Terms &amp; Conditions
                              </button>
                            </Label>
                            {errors.agree_terms ? (
                              <p className="text-sm text-red-600">{errors.agree_terms.message}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Footer (premium sticky-like) */}
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setServerErr(null);
                        setServerMsg(null);
                        setStep((s) => Math.max(1, s - 1));
                      }}
                      disabled={step === 1 || isSubmitting}
                    >
                      ← Back
                    </Button>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                      {step === 1 ? (
                        <Button type="button" onClick={onNextStep1} disabled={isSubmitting} className="w-full sm:w-auto">
                          Continue →
                        </Button>
                      ) : null}

                      {step === 2 ? (
                        <Button
                          type="button"
                          onClick={onNextStep2}
                          disabled={isSubmitting || !canProceedStep2}
                          className="w-full sm:w-auto"
                        >
                          {domainChecking ? "Checking..." : "Continue →"}
                        </Button>
                      ) : null}

                      {step === 3 ? (
                        <Button type="button" onClick={onFinishStep3} disabled={isSubmitting} className="w-full sm:w-auto">
                          Finish &amp; Go To Payment →
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {/* small helper (optional) */}
                  <p className="text-xs text-muted-foreground">
                    Your progress is saved automatically. You can refresh and continue anytime.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* If you want a plain "clear wizard" button for testing */}
      {/* <div className="mt-4">
        <Button variant="outline" onClick={() => clearWizard()}>Clear wizard cache</Button>
      </div> */}
    </div>
  );
}