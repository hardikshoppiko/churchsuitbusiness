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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

import styles from "./RegisterWizardForm.module.css";

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

  localStorage.removeItem(LS_KEY);
  localStorage.removeItem("affiliate_register_id");
  localStorage.removeItem("undefined");

  Object.keys(localStorage).forEach((k) => {
    if (
      k.startsWith("affiliate_register_") ||
      k.startsWith("affiliate_registerWizard")
    ) {
      localStorage.removeItem(k);
    }
  });
}

/* ================================
   Premium UI building blocks
================================ */
function StepPill({ active, done, number, label }) {
  return (
    <div className={styles.stepPill}>
      <div
        className={cn(
          styles.stepPillCircle,
          done
            ? styles.stepPillDone
            : active
            ? styles.stepPillActive
            : styles.stepPillDefault
        )}
      >
        {done ? "✓" : number}
      </div>

      <div className={styles.stepPillTextWrap}>
        <div
          className={cn(
            styles.stepPillLabel,
            active ? styles.stepPillLabelActive : styles.stepPillLabelMuted
          )}
        >
          {label}
        </div>
        <div className={styles.stepPillSubLabel}>Step {number}</div>
      </div>
    </div>
  );
}

function Field({ label, required, error, hint, children }) {
  return (
    <div className={styles.fieldWrap}>
      <div className={styles.fieldHead}>
        <Label className={styles.fieldLabel}>
          {required ? <span className={styles.requiredMark}>*</span> : null}{" "}
          {label}
        </Label>
        {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
      </div>

      {children}

      {error ? <p className={styles.fieldError}>{error}</p> : null}
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
        styles.selectBase,
        disabled ? styles.selectDisabled : "",
        error ? styles.selectError : ""
      )}
    >
      {children}
    </select>
  );
}

function Banner({ variant = "info", title, desc }) {
  const bannerClass =
    variant === "error"
      ? styles.bannerError
      : variant === "success"
      ? styles.bannerSuccess
      : styles.bannerInfo;

  return (
    <div className={cn(styles.bannerBase, bannerClass)}>
      {title ? <div className={styles.bannerTitle}>{title}</div> : null}
      {desc ? <div className={styles.bannerDesc}>{desc}</div> : null}
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
  const { toast } = useToast();

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
    return plans?.[0]?.affiliate_plan_id
      ? String(plans[0].affiliate_plan_id)
      : "";
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
      const res = await fetch(`/api/geo/zones?country_id=${country_id}`, {
        cache: "no-store",
      });
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
      fetchZones(
        String(defaultCountryId),
        defaultZoneId ? String(defaultZoneId) : ""
      );
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

      if (data?.error && data?.domain_not_available) {
        toast({
          title: "Domain not available",
          description: String(data?.error || "Please try another domain."),
          variant: "destructive",
          position: "top-right",
        });
      } else if (data?.success || data?.domain_found) {
        toast({
          title: "Domain looks available",
          description: String(
            data?.domain_found || data?.success || "You can continue."
          ),
          position: "top-right",
        });
      }
    } catch {
      setDomainInfo({ error: "Domain check failed. Please try again." });
      setValue("is_domain_available", 0);

      toast({
        title: "Domain check failed",
        description: "Please try again.",
        variant: "destructive",
        position: "top-right",
      });
    } finally {
      setDomainChecking(false);
    }
  }

  function chooseSuggestedDomain(d) {
    const domain = String(d || "").trim();
    if (!domain) return;

    setValue("website", domain, {
      shouldValidate: true,
      shouldDirty: true,
    });
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

      toast({
        title: "Using your own domain",
        description: "You can continue without availability check.",
        position: "top-right",
      });
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

    const ok = await trigger([
      "firstname",
      "lastname",
      "email",
      "telephone",
    ]);

    if (!ok) {
      toast({
        title: "Please fix the errors",
        description: "Check the highlighted fields to continue.",
        variant: "destructive",
        position: "top-right",
      });
      return;
    }

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
        const msg = data?.message || "Step 1 update failed. Please try again.";
        setServerErr(msg);

        toast({
          title: "Step 1 failed",
          description: msg,
          variant: "destructive",
          position: "top-right",
        });
        return;
      }

      setServerMsg("Step 1 updated successfully.");
      setStep(2);

      toast({
        title: "Step 1 saved",
        description: "Personal info updated successfully.",
        position: "top-right",
      });

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
      const msg = data?.message || "Step 1 failed. Please try again.";
      setServerErr(msg);

      toast({
        title: "Step 1 failed",
        description: msg,
        variant: "destructive",
        position: "top-right",
      });
      return;
    }

    saveAffiliateId(data.affiliate_id);
    setServerMsg("Step 1 saved successfully.");
    setStep(2);

    toast({
      title: "Step 1 saved",
      description: `Affiliate ID created: ${data.affiliate_id}`,
      position: "top-right",
    });
  }

  async function onNextStep2() {
    setServerMsg(null);
    setServerErr(null);

    if (!affiliateId) {
      const msg = "Affiliate ID missing. Please complete Step 1 again.";
      setServerErr(msg);
      setStep(1);

      toast({
        title: "Missing affiliate id",
        description: msg,
        variant: "destructive",
        position: "top-right",
      });
      return;
    }

    const ok = await trigger([
      "affiliate_plan_id",
      "business_name",
      "website",
    ]);

    if (!ok) {
      toast({
        title: "Please fix the errors",
        description: "Check the highlighted fields to continue.",
        variant: "destructive",
        position: "top-right",
      });
      return;
    }

    const plan = getSelectedPlanInfo();

    const payload = {
      step: 2,
      affiliate_id: affiliateId,

      affiliate_plan_id: getValues("affiliate_plan_id"),
      affiliate_type: getValues("affiliate_plan_id"),
      store_name: getValues("business_name"),
      business_name: getValues("business_name"),

      is_customer_own_domain: Number(
        getValues("is_customer_own_domain") || 0
      ),
      is_domain_available: Number(getValues("is_domain_available") || 0),
      is_domain_avaibility_checked: Number(
        getValues("is_domain_avaibility_checked") || 0
      ),

      website: getValues("website")
        ? `https://www.${getValues("website")}`
        : "",

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
      const msg = data?.message || "Step 2 failed. Please try again.";
      setServerErr(msg);

      toast({
        title: "Step 2 failed",
        description: msg,
        variant: "destructive",
        position: "top-right",
      });
      return;
    }

    setServerMsg("Step 2 saved successfully.");
    setStep(3);

    toast({
      title: "Step 2 saved",
      description: "Plan & domain info saved.",
      position: "top-right",
    });
  }

  async function onFinishStep3() {
    setServerMsg(null);
    setServerErr(null);

    if (!affiliateId) {
      const msg = "Affiliate ID missing. Please complete Step 1 again.";
      setServerErr(msg);
      setStep(1);

      toast({
        title: "Missing affiliate id",
        description: msg,
        variant: "destructive",
        position: "top-right",
      });
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

    if (!ok) {
      toast({
        title: "Please fix the errors",
        description: "Check the highlighted fields to finish registration.",
        variant: "destructive",
        position: "top-right",
      });
      return;
    }

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
      const msg = data?.message || "Step 3 failed. Please try again.";
      setServerErr(msg);

      toast({
        title: "Step 3 failed",
        description: msg,
        variant: "destructive",
        position: "top-right",
      });
      return;
    }

    setServerMsg("Registration completed. Redirecting to payment...");

    toast({
      title: "Registration completed",
      description: "Redirecting to payment...",
      position: "top-right",
    });

    const finalAffiliateId = affiliateId;

    setPersistEnabled(false);
    clearWizard();

    setAffiliateId(null);
    setStep(1);

    router.push(`/register/payment/${finalAffiliateId}`);
  }

  /* ---------- derived ---------- */
  const stepTitle =
    step === 1
      ? "Personal Information"
      : step === 2
      ? "Plan & Business"
      : "Store Address & Password";

  const websiteValue = String(getValues("website") || "").trim();
  const domainChecked =
    Number(watch("is_domain_avaibility_checked") || 0) === 1;
  const domainAvailable =
    Number(watch("is_domain_available") || 0) === 1;
  const ownDomain =
    Number(watch("is_customer_own_domain") || 0) === 1;

  const canProceedStep2 =
    !!websiteValue &&
    domainChecked &&
    (domainAvailable || ownDomain) &&
    !domainChecking;

  const progress = Math.round((step / 3) * 100);

  const selectedPlan = useMemo(() => {
    return (
      plans.find(
        (p) => String(p.affiliate_plan_id) === String(selectedPlanId)
      ) || null
    );
  }, [plans, selectedPlanId]);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.wizardShell}>
        <div className={styles.wizardGlow}>
          <div className={styles.wizardGlowLeft} />
          <div className={styles.wizardGlowRight} />
        </div>

        <div className={styles.wizardGrid}>
          {/* Left: sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarIntro}>
              <div className={styles.sidebarEyebrow}>Affiliate Registration</div>
              <div className={styles.sidebarTitle}>Create your store</div>
              <p className={styles.sidebarDesc}>
                Complete 3 quick steps to generate your affiliate website.
              </p>
            </div>

            <div className={styles.sidebarSteps}>
              <StepPill
                number={1}
                label="Personal Info"
                active={step === 1}
                done={step > 1}
              />
              <StepPill
                number={2}
                label="Plan & Domain"
                active={step === 2}
                done={step > 2}
              />
              <StepPill
                number={3}
                label="Address & Password"
                active={step === 3}
                done={false}
              />
            </div>

            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className={styles.progressMeta}>
                <span>
                  Progress:{" "}
                  <span className={styles.progressValue}>{progress}%</span>
                </span>

                {affiliateId ? (
                  <span>
                    {" "}
                    • Affiliate ID:{" "}
                    <span className={styles.progressValue}>{affiliateId}</span>
                  </span>
                ) : null}
              </div>
            </div>

            {selectedPlan && step >= 2 ? (
              <div className={styles.selectedPlanBox}>
                <div className={styles.selectedPlanLabel}>Selected Plan</div>
                <div className={styles.selectedPlanName}>{selectedPlan.name}</div>
                <div className={styles.selectedPlanPrice}>
                  {money(selectedPlan.fees)} / month
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: form */}
          <div className={styles.formSide}>
            {/* Mobile step indicator */}
            <div className={styles.mobileStepBox}>
              <div className={styles.mobileStepHead}>
                <div className={styles.mobileStepTitle}>Affiliate Registration</div>
                <div className={styles.mobileStepMeta}>
                  Step{" "}
                  <span className={styles.mobileStepMetaStrong}>{step}</span> / 3
                </div>
              </div>

              <div className={styles.mobileProgressBar}>
                <div
                  className={styles.mobileProgressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className={styles.formPanel}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>{stepTitle}</h2>
                <p className={styles.formDesc}>
                  Step <span className={styles.formStrong}>{step}</span> of{" "}
                  <span className={styles.formStrong}>3</span>
                </p>
              </div>

              {serverErr ? (
                <Banner variant="error" title="Error" desc={serverErr} />
              ) : null}

              {serverMsg ? (
                <div className={styles.bannerSpacing}>
                  <Banner variant="success" title="Success" desc={serverMsg} />
                </div>
              ) : null}

              <form
                onSubmit={(e) => e.preventDefault()}
                className={styles.form}
              >
                {/* STEP 1 */}
                {step === 1 ? (
                  <div className={styles.sectionStack}>
                    <div className={styles.twoColGrid}>
                      <Field
                        label="First Name"
                        required
                        error={errors.firstname?.message}
                      >
                        <Input
                          {...register("firstname", {
                            required: "First name is required",
                            minLength: {
                              value: 1,
                              message: "Min 1 character",
                            },
                            maxLength: {
                              value: 32,
                              message: "Max 32 characters",
                            },
                          })}
                          className={cn(
                            styles.inputBase,
                            errors.firstname ? styles.inputError : ""
                          )}
                        />
                      </Field>

                      <Field
                        label="Last Name"
                        required
                        error={errors.lastname?.message}
                      >
                        <Input
                          {...register("lastname", {
                            required: "Last name is required",
                            minLength: {
                              value: 1,
                              message: "Min 1 character",
                            },
                            maxLength: {
                              value: 32,
                              message: "Max 32 characters",
                            },
                          })}
                          className={cn(
                            styles.inputBase,
                            errors.lastname ? styles.inputError : ""
                          )}
                        />
                      </Field>
                    </div>

                    <Field
                      label="Email"
                      required
                      error={errors.email?.message}
                    >
                      <Input
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                            message: "Please enter a valid email address",
                          },
                        })}
                        className={cn(
                          styles.inputBase,
                          errors.email ? styles.inputError : ""
                        )}
                      />
                    </Field>

                    <Field
                      label="Phone / Mobile"
                      required
                      error={errors.telephone?.message}
                      hint="10 digits"
                    >
                      <Input
                        inputMode="numeric"
                        placeholder="10 digit mobile number"
                        {...register("telephone", {
                          required: "Phone/Mobile is required",
                          pattern: {
                            value: /^\d{10}$/,
                            message: "Phone/Mobile must be exactly 10 digits",
                          },
                        })}
                        onInput={(e) => {
                          e.target.value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                        }}
                        className={cn(
                          styles.inputBase,
                          errors.telephone ? styles.inputError : ""
                        )}
                      />
                    </Field>
                  </div>
                ) : null}

                {/* STEP 2 */}
                {step === 2 ? (
                  <div className={styles.sectionStack}>
                    <div className={styles.sectionStack}>
                      <div className={styles.sectionLabel}>
                        <span className={styles.requiredMark}>*</span> Select Your
                        Plan
                      </div>

                      {plans.length === 0 ? (
                        <p className={styles.emptyText}>
                          No plans available right now.
                        </p>
                      ) : (
                        <div className={styles.planGrid}>
                          {plans.map((p) => {
                            const active =
                              String(selectedPlanId) ===
                              String(p.affiliate_plan_id);

                            return (
                              <label
                                key={p.affiliate_plan_id}
                                className={cn(
                                  styles.planCard,
                                  active ? styles.planCardActive : ""
                                )}
                              >
                                <input
                                  type="radio"
                                  value={String(p.affiliate_plan_id)}
                                  className={styles.planRadio}
                                  {...register("affiliate_plan_id", {
                                    required: "Please select a plan",
                                  })}
                                />

                                <div className={styles.planContent}>
                                  <div className={styles.planHead}>
                                    <div className={styles.planName}>{p.name}</div>
                                    <div className={styles.planPrice}>
                                      {money(p.fees)}/mo
                                    </div>
                                  </div>

                                  {p.tag_line ? (
                                    <div className={styles.planTagline}>
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
                        <p className={styles.fieldError}>
                          {errors.affiliate_plan_id.message}
                        </p>
                      ) : null}
                    </div>

                    <Separator className={styles.separator} />

                    <Field
                      label="Business Name"
                      required
                      error={errors.business_name?.message}
                    >
                      <Input
                        {...register("business_name", {
                          required: "Business name is required",
                          minLength: {
                            value: 3,
                            message: "Min 3 characters",
                          },
                          maxLength: {
                            value: 32,
                            message: "Max 32 characters",
                          },
                        })}
                        className={cn(
                          styles.inputBase,
                          errors.business_name ? styles.inputError : ""
                        )}
                      />
                    </Field>

                    <Field
                      label="Website Domain"
                      error={errors.website?.message}
                      hint="without https://www"
                    >
                      <div className={styles.websiteInputWrap}>
                        <div className={styles.websitePrefix}>https://www.</div>

                        <Input
                          className={cn(
                            styles.inputBase,
                            styles.websiteInput,
                            errors.website ? styles.inputError : ""
                          )}
                          placeholder="yourdomain.com"
                          {...register("website", {
                            validate: (v) => {
                              if (!v) return true;
                              if (/\s/.test(v))
                                return "Website cannot contain spaces";
                              if (
                                v.startsWith("http://") ||
                                v.startsWith("https://") ||
                                v.startsWith("www.")
                              ) {
                                return "Do not include https:// or www";
                              }
                              return (
                                /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v) ||
                                "Enter a valid domain like yourdomain.com"
                              );
                            },
                          })}
                          onBlur={() => {
                            const v = String(getValues("website") || "").trim();
                            if (!v) return;
                            const ok =
                              /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v) &&
                              !/\s/.test(v);
                            if (ok) checkDomainAvaibilityStatus(v);
                          }}
                        />
                      </div>

                      <input
                        type="hidden"
                        {...register("is_customer_own_domain")}
                      />
                      <input type="hidden" {...register("is_domain_available")} />
                      <input
                        type="hidden"
                        {...register("is_domain_avaibility_checked")}
                      />

                      {domainChecking ? (
                        <div className={styles.helperText}>
                          Checking domain availability...
                        </div>
                      ) : null}

                      {domainInfo?.error && domainInfo?.domain_not_available ? (
                        <div className={styles.domainErrorBox}>
                          {domainInfo.error}
                        </div>
                      ) : null}

                      {domainInfo?.success && domainInfo?.domain_found ? (
                        <div className={styles.domainSuccessBox}>
                          {domainInfo.domain_found}
                        </div>
                      ) : null}

                      {Array.isArray(domainInfo?.domain_suggestions) &&
                      domainInfo.domain_suggestions.length > 0 ? (
                        <div className={styles.suggestionWrap}>
                          <div className={styles.checkboxRow}>
                            <input
                              id="input-business-own-domain"
                              type="checkbox"
                              checked={ownDomainChecked}
                              onChange={(e) =>
                                onOwnDomainToggle(e.target.checked)
                              }
                              className={styles.checkbox}
                            />
                            <Label
                              htmlFor="input-business-own-domain"
                              className={styles.checkboxLabel}
                            >
                              I already own this domain
                            </Label>
                          </div>

                          <div className={styles.sectionLabel}>Suggestions</div>

                          <div className={styles.suggestionList}>
                            {domainInfo.domain_suggestions
                              .slice(0, 8)
                              .map((d) => (
                                <button
                                  type="button"
                                  key={d}
                                  onClick={() => chooseSuggestedDomain(d)}
                                  className={styles.suggestionBtn}
                                >
                                  {d}
                                </button>
                              ))}
                          </div>
                        </div>
                      ) : null}

                      {!canProceedStep2 ? (
                        <p className={styles.helperText}>
                          Please check your domain availability or confirm you own
                          the domain to continue.
                        </p>
                      ) : null}
                    </Field>
                  </div>
                ) : null}

                {/* STEP 3 */}
                {step === 3 ? (
                  <div className={styles.sectionStack}>
                    <Field
                      label="Address 1"
                      required
                      error={errors.address_1?.message}
                    >
                      <Input
                        {...register("address_1", {
                          required: "Address 1 is required",
                        })}
                        className={cn(
                          styles.inputBase,
                          errors.address_1 ? styles.inputError : ""
                        )}
                      />
                    </Field>

                    <Field
                      label="Address 2"
                      error={errors.address_2?.message}
                    >
                      <Input
                        {...register("address_2")}
                        className={styles.inputBase}
                      />
                    </Field>

                    <div className={styles.twoColGrid}>
                      <Field
                        label="City"
                        required
                        error={errors.city?.message}
                      >
                        <Input
                          {...register("city", {
                            required: "City is required",
                          })}
                          className={cn(
                            styles.inputBase,
                            errors.city ? styles.inputError : ""
                          )}
                        />
                      </Field>

                      <Field
                        label="Zip Code"
                        required
                        error={errors.postcode?.message}
                      >
                        <Input
                          {...register("postcode", {
                            required: "Zip code is required",
                          })}
                          className={cn(
                            styles.inputBase,
                            errors.postcode ? styles.inputError : ""
                          )}
                        />
                      </Field>
                    </div>

                    <div className={styles.twoColGrid}>
                      <Field
                        label="Country"
                        required
                        error={errors.country_id?.message}
                      >
                        <Select
                          value={String(watch("country_id") || "")}
                          onChange={(e) =>
                            setValue("country_id", e.target.value, {
                              shouldValidate: true,
                            })
                          }
                          error={!!errors.country_id}
                        >
                          <option value="">--- Please Select ---</option>
                          {countries.map((c) => (
                            <option
                              key={c.country_id}
                              value={String(c.country_id)}
                            >
                              {c.name}
                            </option>
                          ))}
                        </Select>
                      </Field>

                      <Field
                        label="Region / State"
                        required
                        error={errors.zone_id?.message}
                      >
                        <Select
                          value={String(watch("zone_id") || "")}
                          onChange={(e) =>
                            setValue("zone_id", e.target.value, {
                              shouldValidate: true,
                            })
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

                        {!zonesLoading &&
                        selectedCountryId &&
                        zones.length === 0 ? (
                          <p className={styles.helperText}>
                            No regions/states available for selected country.
                          </p>
                        ) : null}
                      </Field>
                    </div>

                    <Separator className={styles.separator} />

                    <div className={styles.twoColGrid}>
                      <Field
                        label="Password"
                        required
                        error={errors.password?.message}
                      >
                        <Input
                          type="password"
                          {...register("password", {
                            required: "Password is required",
                            minLength: {
                              value: 6,
                              message: "Minimum 6 characters",
                            },
                            maxLength: {
                              value: 20,
                              message: "Maximum 20 characters",
                            },
                          })}
                          className={cn(
                            styles.inputBase,
                            errors.password ? styles.inputError : ""
                          )}
                        />
                      </Field>

                      <Field
                        label="Password Confirm"
                        required
                        error={errors.confirm?.message}
                      >
                        <Input
                          type="password"
                          {...register("confirm", {
                            required: "Confirm password is required",
                            validate: (v) =>
                              v === getValues("password") ||
                              "Passwords do not match",
                          })}
                          className={cn(
                            styles.inputBase,
                            errors.confirm ? styles.inputError : ""
                          )}
                        />
                      </Field>
                    </div>

                    <div className={styles.termsBox}>
                      <div className={styles.termsRow}>
                        <input
                          id="agree_terms"
                          type="checkbox"
                          checked={!!watch("agree_terms")}
                          onChange={(e) =>
                            setValue("agree_terms", e.target.checked, {
                              shouldValidate: true,
                            })
                          }
                          className={styles.checkbox}
                        />

                        <div className={styles.termsContent}>
                          <Label
                            htmlFor="agree_terms"
                            className={styles.termsLabel}
                          >
                            I agree to the{" "}
                            <button
                              type="button"
                              className={styles.termsLink}
                              onClick={handleOpenTerms}
                            >
                              Terms &amp; Conditions
                            </button>
                          </Label>

                          {errors.agree_terms ? (
                            <p className={styles.fieldError}>
                              {errors.agree_terms.message}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Footer */}
                <div className={styles.footerActions}>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setServerErr(null);
                      setServerMsg(null);
                      setStep((s) => Math.max(1, s - 1));
                    }}
                    disabled={step === 1 || isSubmitting}
                    className={styles.backBtn}
                  >
                    ← Back
                  </Button>

                  <div className={styles.forwardActions}>
                    {step === 1 ? (
                      <Button
                        type="button"
                        onClick={onNextStep1}
                        disabled={isSubmitting}
                        className={styles.primaryBtn}
                      >
                        Continue →
                      </Button>
                    ) : null}

                    {step === 2 ? (
                      <Button
                        type="button"
                        onClick={onNextStep2}
                        disabled={isSubmitting || !canProceedStep2}
                        className={styles.primaryBtn}
                      >
                        {domainChecking ? "Checking..." : "Continue →"}
                      </Button>
                    ) : null}

                    {step === 3 ? (
                      <Button
                        type="button"
                        onClick={onFinishStep3}
                        disabled={isSubmitting}
                        className={styles.primaryBtn}
                      >
                        Finish &amp; Go To Payment →
                      </Button>
                    ) : null}
                  </div>
                </div>

                <p className={styles.bottomHelp}>
                  Your progress is saved automatically. You can refresh and
                  continue anytime.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}