"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { openModal } from "@/lib/modal";
import TermsContent from "@/app/register/TermsContent";

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

function Row({ label, required, error, children }) {
  return (
    <div className="row mb-3 align-items-center">
      <label className="col-sm-4 col-lg-3 col-form-label">
        {required ? <span className="text-danger">*</span> : null} {label}
      </label>
      <div className="col-sm-8 col-lg-9">
        {children}
        {error ? <div className="invalid-feedback d-block">{error}</div> : null}
      </div>
    </div>
  );
}

function handleOpenTerms() {
  openModal({
    title: "Terms & Conditions",
    size: "lg",
    content: <TermsContent />,
  });
}

/* ================================
   Wizard LocalStorage helpers
================================ */
const LS_KEY = "affiliate_register_wizard_v1";

function safeJsonParse(v) {
  try { return JSON.parse(v); } catch { return null; }
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
}

/* ================================
   Component starts here
================================ */

export default function RegisterWizardForm({
  plans = [],
  countries = [],
  defaultCountryId = 0,
  defaultZoneId = 0,
}) {
  const router = useRouter();

  const [step, setStep] = useState(1); // 1,2,3
  const [affiliateId, setAffiliateId] = useState(null);

  const [serverMsg, setServerMsg] = useState(null);
  const [serverErr, setServerErr] = useState(null);

  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);

  const [domainInfo, setDomainInfo] = useState(null);
  const [domainChecking, setDomainChecking] = useState(false);
  const [ownDomainChecked, setOwnDomainChecked] = useState(false);

  const [isRestored, setIsRestored] = useState(false);

  const defaultPlanId = useMemo(() => {
    return plans?.[0]?.affiliate_plan_id ? String(plans[0].affiliate_plan_id) : "";
  }, [plans]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      // step 2
      affiliate_plan_id: defaultPlanId,
      business_name: "",
      website: "",
      is_customer_own_domain: 0,
      is_domain_available: 0,
      is_domain_avaibility_checked: 0,

      // step 1
      firstname: "",
      lastname: "",
      email: "",
      telephone: "",

      // step 3
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
    // prevent saving before initial hydration
    if (typeof window === "undefined") return;

    saveWizard({
      step,
      affiliateId,
      values: allValues,
      savedAt: Date.now(),
    });
  }, [allValues, step, affiliateId]);

  const selectedCountryId = watch("country_id");
  const selectedPlanId = watch("affiliate_plan_id");

  // ---------- Zones loader ----------
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

      // only clear if no valid keepZoneId
      setValue("zone_id", "");
    } finally {
      setZonesLoading(false);
    }
  }

  useEffect(() => {
    // load zones for defaults (only helpful for step 3)
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

    // ✅ keep the zone_id that is already in the form (from localStorage after refresh)
    const keepZoneId = String(getValues("zone_id") || "");
    fetchZones(String(selectedCountryId), keepZoneId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryId, isRestored]);

  // ---------- Persist affiliateId (optional but useful) ----------
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

  function clearAffiliateIdCache() {
    try {
      localStorage.removeItem("affiliate_register_id");
    } catch {}
  }

  // ---------- Helpers ----------
  function getSelectedPlanInfo() {
    const pid = Number(getValues("affiliate_plan_id") || 0);
    return plans.find((p) => Number(p.affiliate_plan_id) === pid) || null;
  }

  async function checkDomainAvaibilityStatus(domainParam) {
    const website = String(domainParam ?? getValues("website") ?? "").trim();
    if (!website) return;

    // reset flags each time user checks
    setDomainChecking(true);
    setOwnDomainChecked(false);
    setDomainInfo(null);

    // mark "checked" immediately (like PHP does)
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

      // default like PHP
      setValue("is_domain_available", 1);

      // if error + domain not available → mark unavailable
      if (data?.error && data?.domain_not_available) {
        setValue("is_domain_available", 0);
      }

      setDomainInfo(data);
    } catch (e) {
      setDomainInfo({ error: "Domain check failed. Please try again." });
      setValue("is_domain_available", 0);
    } finally {
      setDomainChecking(false);
    }
  }

  // click suggestion
  function chooseSuggestedDomain(d) {
    const domain = String(d || "").trim();
    if (!domain) return;

    setValue("website", domain, { shouldValidate: true, shouldDirty: true });
    setDomainInfo(null);

    // IMPORTANT: call checker with the domain itself (not reading old getValues)
    checkDomainAvaibilityStatus(domain);
  }

  // own domain checkbox
  function onOwnDomainToggle(checked) {
    const v = !!checked;
    setOwnDomainChecked(v);

    setValue("is_domain_avaibility_checked", 1);

    if (v) {
      setValue("is_customer_own_domain", 1);
      setValue("is_domain_available", 1);

      // mimic PHP: remove suggestions/messages
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

  // ---------- Step Actions ----------
  async function onNextStep1() {
    setServerMsg(null);
    setServerErr(null);

    // validate step1 fields
    const ok = await trigger(["firstname", "lastname", "email", "telephone"]);
    if (!ok) return;

    // ✅ If affiliate already created, DO NOT re-create
    if (affiliateId && Number(affiliateId) > 0) {
      // Optional: if you want to update step1 fields on existing record
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

    // ✅ First time only: create new affiliate (insert)
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

    // Build the same payload style you already use
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

      // vanity url: https://www. + domain
      website: getValues("website") ? `https://www.${getValues("website")}` : "",

      // plan-related data you pass today
      fees: plan?.fees || 0,
      stripe_plan_id: plan?.stripe_plan_id || "",
      price_schema: plan?.price_schema || "",
      default_markup: plan?.default_markup || 0,
      retail_price_commission: plan?.retail_price_commission || 0,
      is_catalog_access: plan?.is_catalog_access || 0,

      // keep same defaults
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
    // clearAffiliateIdCache();

    clearWizard();
    router.push(`/register/payment/${affiliateId}`);
  }

  // ---------- UI ----------
  const stepTitle = step === 1 ? "Personal Information" : step === 2 ? "Plan & Business" : "Store Address & Password";

  // Check if can proceed to step 2
  const websiteValue = String(getValues("website") || "").trim();

  const domainChecked = Number(watch("is_domain_avaibility_checked") || 0) === 1;
  const domainAvailable = Number(watch("is_domain_available") || 0) === 1;
  const ownDomain = Number(watch("is_customer_own_domain") || 0) === 1;

  // ✅ Only hidden fields decide the button enable/disable
  const canProceedStep2 = !!websiteValue && domainChecked && (domainAvailable || ownDomain) && !domainChecking;

  /* END ADD */

  return (
    <div className="card">
      <div className="card-header bg-white">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="fw-bold">{stepTitle}</div>

          <div className="small text-muted">
            Step <strong>{step}</strong> of <strong>3</strong>
            {affiliateId ? (
              <span className="ms-2">
                | Affiliate ID: <strong>{affiliateId}</strong>
              </span>
            ) : null}
          </div>
        </div>

        {/* simple progress */}
        <div className="progress mt-3" style={{ height: 8 }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${(step / 3) * 100}%` }}
            aria-valuenow={(step / 3) * 100}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>

      <div className="card-body">
        {serverErr ? <div className="alert alert-danger">{serverErr}</div> : null}
        {serverMsg ? <div className="alert alert-success">{serverMsg}</div> : null}

        {/* We keep one form for layout, but we manually call step handlers */}
        <form onSubmit={(e) => e.preventDefault()}>
          {/* ===================== */}
          {/* STEP 1 */}
          {/* ===================== */}
          {step === 1 ? (
            <>
              <Row label="First Name" required error={errors.firstname?.message}>
                <input
                  className={`form-control ${errors.firstname ? "is-invalid" : ""}`}
                  {...register("firstname", {
                    required: "First name is required",
                    minLength: { value: 1, message: "Min 1 character" },
                    maxLength: { value: 32, message: "Max 32 characters" },
                  })}
                />
              </Row>

              <Row label="Last Name" required error={errors.lastname?.message}>
                <input
                  className={`form-control ${errors.lastname ? "is-invalid" : ""}`}
                  {...register("lastname", {
                    required: "Last name is required",
                    minLength: { value: 1, message: "Min 1 character" },
                    maxLength: { value: 32, message: "Max 32 characters" },
                  })}
                />
              </Row>

              <Row label="Email" required error={errors.email?.message}>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
              </Row>

              <Row label="Phone / Mobile" required error={errors.telephone?.message}>
                <input
                  inputMode="numeric"
                  placeholder="10 digit mobile number"
                  className={`form-control ${errors.telephone ? "is-invalid" : ""}`}
                  {...register("telephone", {
                    required: "Phone/Mobile is required",
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Phone/Mobile must be exactly 10 digits",
                    },
                  })}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  }}
                />
              </Row>
            </>
          ) : null}

          {/* ===================== */}
          {/* STEP 2 */}
          {/* ===================== */}
          {step === 2 ? (
            <>
              <div className="mb-3">
                <div className="fw-bold mb-2">
                  <span className="text-danger me-1">*</span>Select Your Plan
                </div>

                {plans.length === 0 ? (
                  <div className="text-muted">No plans available right now.</div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {plans.map((p) => (
                      <label
                        key={p.affiliate_plan_id}
                        className="d-flex align-items-start gap-2 border rounded p-3 plan-row"
                      >
                        <input
                          type="radio"
                          className="form-check-input mt-1"
                          value={String(p.affiliate_plan_id)}
                          {...register("affiliate_plan_id", {
                            required: "Please select a plan",
                          })}
                        />

                        <div className="flex-grow-1">
                          <div className="fw-semibold">
                            {p.name}{" "}
                            <span className="text-muted">
                              ({money(p.fees)} / Month)
                            </span>
                          </div>
                          {p.tag_line ? (
                            <div className="text-muted small">{p.tag_line}</div>
                          ) : null}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {errors.affiliate_plan_id ? (
                  <div className="text-danger small mt-2">
                    {errors.affiliate_plan_id.message}
                  </div>
                ) : null}
              </div>

              <hr />

              <Row label="Business Name" required error={errors.business_name?.message}>
                <input
                  className={`form-control ${errors.business_name ? "is-invalid" : ""}`}
                  {...register("business_name", {
                    required: "Business name is required",
                    minLength: { value: 3, message: "Min 3 characters" },
                    maxLength: { value: 32, message: "Max 32 characters" },
                  })}
                />
              </Row>

              <Row label="Website" error={errors.website?.message}>
                <div id="input-website-section">
                  <div className="input-group">
                    <span className="input-group-text">https://www.</span>
                    <input
                      className={`form-control ${errors.website ? "is-invalid" : ""}`}
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

                        // only hit API if looks like a domain
                        const ok = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v) && !/\s/.test(v);
                        if (ok) checkDomainAvaibilityStatus(v);
                      }}
                    />
                  </div>

                  {/* hidden fields (same as PHP) */}
                  <input type="hidden" {...register("is_customer_own_domain")} />
                  <input type="hidden" {...register("is_domain_available")} />
                  <input type="hidden" {...register("is_domain_avaibility_checked")} />
                  
                  {domainChecking ? (
                    <div className="small text-muted mt-2">
                      <i className="fa fa-spinner fa-spin me-1"></i> Please wait… checking domain availability.
                    </div>
                  ) : null}

                  {/* Result messages like PHP */}
                  {domainInfo?.error && domainInfo?.domain_not_available ? (
                    <div className="mt-2">
                      <div className="text-danger fw-semibold">
                        <i className="bi bi-exclamation-triangle me-1" />
                        {domainInfo.error}
                      </div>
                    </div>
                  ) : null}

                  {domainInfo?.success && domainInfo?.domain_found ? (
                    <div className="mt-2 text-success fw-semibold">
                      <i className="bi bi-check-circle me-1" />
                      {domainInfo.domain_found}
                    </div>
                  ) : null}

                  {/* suggestions + own-domain checkbox */}
                  {Array.isArray(domainInfo?.domain_suggestions) && domainInfo.domain_suggestions.length > 0 ? (
                    <div className="mt-3">
                      <div className="form-check mb-2">
                        <input
                          id="input-business-own-domain"
                          className="form-check-input"
                          type="checkbox"
                          onChange={(e) => onOwnDomainToggle(e.target.checked)}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="input-business-own-domain">
                          Do You Own Above Domain Name?
                        </label>
                      </div>

                      <div className="fw-semibold mb-2">Available Domains</div>
                      <div className="d-flex flex-wrap gap-2">
                        {domainInfo.domain_suggestions.slice(0, 6).map((d) => (
                          <button
                            type="button"
                            key={d}
                            className="btn btn-link p-0 text-decoration-underline"
                            onClick={() => chooseSuggestedDomain(d)}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </Row>

              <div className="alert alert-info mb-0">
                <div className="fw-semibold">Selected Plan</div>
                <div className="small">
                  {(() => {
                    const plan = plans.find(
                      (p) => String(p.affiliate_plan_id) === String(selectedPlanId)
                    );
                    if (!plan) return "No plan selected";
                    return (
                      <>
                        {plan.name} — <strong>{money(plan.fees)}</strong> / month
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Domain warning */}
              {!canProceedStep2 ? (
                <div className="text-muted small mt-2">
                  Please check your domain availability (or confirm you own the domain) to continue.
                </div>
              ) : null}
            </>
          ) : null}

          {/* ===================== */}
          {/* STEP 3 */}
          {/* ===================== */}
          {step === 3 ? (
            <>
              <Row label="Address 1" required error={errors.address_1?.message}>
                <input
                  className={`form-control ${errors.address_1 ? "is-invalid" : ""}`}
                  {...register("address_1", { required: "Address 1 is required" })}
                />
              </Row>

              <Row label="Address 2" error={errors.address_2?.message}>
                <input className="form-control" {...register("address_2")} />
              </Row>

              <Row label="City" required error={errors.city?.message}>
                <input
                  className={`form-control ${errors.city ? "is-invalid" : ""}`}
                  {...register("city", { required: "City is required" })}
                />
              </Row>

              <Row label="Zip Code" required error={errors.postcode?.message}>
                <input
                  className={`form-control ${errors.postcode ? "is-invalid" : ""}`}
                  {...register("postcode", { required: "Zip code is required" })}
                />
              </Row>

              <Row label="Country" required error={errors.country_id?.message}>
                <select
                  className={`form-select ${errors.country_id ? "is-invalid" : ""}`}
                  {...register("country_id", { required: "Country is required" })}
                >
                  <option value="">--- Please Select ---</option>
                  {countries.map((c) => (
                    <option key={c.country_id} value={String(c.country_id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Row>

              <Row label="Region / State" required error={errors.zone_id?.message}>
                <select
                  className={`form-select ${errors.zone_id ? "is-invalid" : ""}`}
                  {...register("zone_id", { required: "Region/State is required" })}
                  disabled={!selectedCountryId || zonesLoading}
                >
                  <option value="">
                    {zonesLoading ? "Loading..." : "--- Please Select ---"}
                  </option>
                  {zones.map((z) => (
                    <option key={z.zone_id} value={String(z.zone_id)}>
                      {z.name}
                    </option>
                  ))}
                </select>

                {!zonesLoading && selectedCountryId && zones.length === 0 ? (
                  <div className="text-muted small mt-1">
                    No regions/states available for selected country.
                  </div>
                ) : null}
              </Row>

              <hr />

              <Row label="Password" required error={errors.password?.message}>
                <input
                  type="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                    maxLength: { value: 20, message: "Maximum 20 characters" },
                  })}
                />
              </Row>

              <Row label="Password Confirm" required error={errors.confirm?.message}>
                <input
                  type="password"
                  className={`form-control ${errors.confirm ? "is-invalid" : ""}`}
                  {...register("confirm", {
                    required: "Confirm password is required",
                    validate: (v) =>
                      v === getValues("password") || "Passwords do not match",
                  })}
                />
              </Row>

              {/* Terms */}
              <div className="row mb-2">
                <div className="col-12">
                  <div className="form-check">
                    <input
                      id="agree_terms"
                      type="checkbox"
                      className={`form-check-input ${errors.agree_terms ? "is-invalid" : ""}`}
                      {...register("agree_terms", {
                        validate: (v) => v === true || "You must agree to the Terms & Conditions",
                      })}
                    />
                    <label className="form-check-label" htmlFor="agree_terms">
                      I agree to the{" "}
                      <button
                        type="button"
                        className="btn btn-link p-0 align-baseline text-decoration-underline"
                        onClick={handleOpenTerms}
                      >
                        Terms &amp; Conditions
                      </button>
                    </label>
                    {errors.agree_terms ? (
                      <div className="invalid-feedback d-block">
                        {errors.agree_terms.message}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {/* Footer Buttons */}
          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setServerErr(null);
                setServerMsg(null);
                setStep((s) => Math.max(1, s - 1));
              }}
              disabled={step === 1 || isSubmitting}
            >
              ← Back
            </button>

            {step === 1 ? (
              <button
                type="button"
                className="btn btn-dark"
                onClick={onNextStep1}
                disabled={isSubmitting}
              >
                Next →
              </button>
            ) : null}

            {step === 2 ? (
              <button
                type="button"
                className="btn btn-dark"
                onClick={onNextStep2}
                disabled={isSubmitting || !canProceedStep2}
              >
                {domainChecking ? "Checking domain..." : "Next →"}
              </button>
            ) : null}

            {step === 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onFinishStep3}
                disabled={isSubmitting}
              >
                Finish &amp; Go To Payment →
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}