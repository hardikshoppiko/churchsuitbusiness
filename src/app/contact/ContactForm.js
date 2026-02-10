"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/db-utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {required ? <span className="text-red-600">*</span> : null} {label}
      </Label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function WarningBar({ show }) {
  if (!show) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
      Warning: Please check form carefully for errors!
    </div>
  );
}

export default function ContactForm({ session, storeName = "Support" }) {
  const [serverMsg, setServerMsg] = useState(null);
  const [serverErr, setServerErr] = useState(null);

  const defaults = useMemo(() => {
    return {
      firstname: session?.firstname || "",
      lastname: session?.lastname || "",
      email: session?.email || "",
      telephone: session?.telephone || "",
      subject: "",
      message: "",
    };
  }, [session]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, submitCount },
  } = useForm({
    defaultValues: defaults,
    mode: "onSubmit",          // show errors on submit (like OpenCart)
    reValidateMode: "onChange" // remove errors while typing
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const hasErrors = Object.keys(errors || {}).length > 0;
  const showWarning = submitCount > 0 && hasErrors;

  async function onSubmit(values) {
    setServerMsg(null);
    setServerErr(null);

    try {
      console.log("CONTACT FORM:", values);
      setServerMsg("Message sent successfully. Our team will contact you soon.");
      
      // TODO: connect API later

      reset();
    } catch (e) {
      setServerErr("Failed to send message. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Server messages */}
      {serverErr ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverErr}
        </div>
      ) : null}

      {serverMsg ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {serverMsg}
        </div>
      ) : null}

      {/* OpenCart-like warning bar */}
      <WarningBar show={showWarning} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First Name" required error={errors.firstname?.message}>
          <Input
            {...register("firstname", {
              required: "First Name must be between 1 and 32 characters!",
              minLength: { value: 1, message: "First Name must be between 1 and 32 characters!" },
              maxLength: { value: 32, message: "First Name must be between 1 and 32 characters!" },
            })}
            className={cn(errors.firstname ? "border-red-400 focus-visible:ring-red-200" : "")}
          />
        </Field>

        <Field label="Last Name" required error={errors.lastname?.message}>
          <Input
            {...register("lastname", {
              required: "Last Name must be between 1 and 32 characters!",
              minLength: { value: 1, message: "Last Name must be between 1 and 32 characters!" },
              maxLength: { value: 32, message: "Last Name must be between 1 and 32 characters!" },
            })}
            className={cn(errors.lastname ? "border-red-400 focus-visible:ring-red-200" : "")}
          />
        </Field>
      </div>

      <Field label="E-Mail" required error={errors.email?.message}>
        <Input
          type="email"
          {...register("email", {
            required: "E-Mail Address does not appear to be valid!",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
              message: "E-Mail Address does not appear to be valid!",
            },
          })}
          className={cn(errors.email ? "border-red-400 focus-visible:ring-red-200" : "")}
        />
      </Field>

      <Field label="Mobile" required error={errors.telephone?.message}>
        <Input
          inputMode="numeric"
          placeholder="10 digit mobile number"
          {...register("telephone", {
            required: "Mobile must be maximum 10 digit & must be numeric!",
            pattern: { value: /^\d{10}$/, message: "Mobile must be maximum 10 digit & must be numeric!" },
          })}
          onInput={(e) => {
            e.target.value = String(e.target.value || "").replace(/\D/g, "").slice(0, 10);
          }}
          className={cn(errors.telephone ? "border-red-400 focus-visible:ring-red-200" : "")}
        />
      </Field>

      <Field label="Subject" required error={errors.subject?.message}>
        <Input
          placeholder="Example: Login issue / Billing / Store setup"
          {...register("subject", {
            required: "Subject must be between 3 and 80 characters!",
            minLength: { value: 3, message: "Subject must be between 3 and 80 characters!" },
            maxLength: { value: 80, message: "Subject must be between 3 and 80 characters!" },
          })}
          className={cn(errors.subject ? "border-red-400 focus-visible:ring-red-200" : "")}
        />
      </Field>

      <Field label="Message" required error={errors.message?.message}>
        <Textarea
          placeholder="Write your message here..."
          className={cn(
            "min-h-[140px]",
            errors.message ? "border-red-400 focus-visible:ring-red-200" : ""
          )}
          {...register("message", {
            required: "Message must be between 10 and 2000 characters!",
            minLength: { value: 10, message: "Message must be between 10 and 2000 characters!" },
            maxLength: { value: 2000, message: "Message must be between 10 and 2000 characters!" },
          })}
        />
        <p className="text-xs text-muted-foreground">
          Please include your affiliate ID, error message, and steps that caused the issue.
        </p>
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          By submitting, you agree to be contacted by {storeName}.
        </p>

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </form>
  );
}