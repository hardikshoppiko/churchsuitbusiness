"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/db-utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import styles from "./ContactForm.module.css";

function Field({ label, required, error, children }) {
  return (
    <div className={styles.fieldWrap}>
      <Label className={styles.fieldLabel}>
        {required ? <span className={styles.requiredMark}>*</span> : null} {label}
      </Label>
      {children}
      {error ? <p className={styles.fieldError}>{error}</p> : null}
    </div>
  );
}

function WarningBar({ show }) {
  if (!show) return null;

  return (
    <div className={styles.warningBar}>
      Warning: Please check form carefully for errors!
    </div>
  );
}

export default function ContactForm({ session, storeName = "Support" }) {
  const [serverMsg, setServerMsg] = useState(null);
  const [serverErr, setServerErr] = useState(null);

  const { toast } = useToast();

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
    mode: "onSubmit",
    reValidateMode: "onChange",
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

      toast({
        title: "Message sent",
        description: `Thanks! ${storeName} will contact you soon.`,
      });

      reset();
    } catch (e) {
      setServerErr("Failed to send message. Please try again.");

      toast({
        title: "Failed to send",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }

  function onInvalid() {
    toast({
      title: "Please fix the errors",
      description: "Check the highlighted fields and try again.",
      variant: "destructive",
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className={styles.formWrap}
    >
      {/* {serverErr ? <div className={styles.errorBox}>{serverErr}</div> : null} */}
      {/* {serverMsg ? <div className={styles.successBox}>{serverMsg}</div> : null} */}
      {/* <WarningBar show={showWarning} /> */}

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
            className={cn(
              styles.inputBase,
              errors.firstname ? styles.inputError : ""
            )}
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
            className={cn(
              styles.inputBase,
              errors.lastname ? styles.inputError : ""
            )}
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
          className={cn(
            styles.inputBase,
            errors.email ? styles.inputError : ""
          )}
        />
      </Field>

      <Field label="Mobile" required error={errors.telephone?.message}>
        <Input
          inputMode="numeric"
          placeholder="10 digit mobile number"
          {...register("telephone", {
            required: "Mobile must be maximum 10 digit & must be numeric!",
            pattern: {
              value: /^\d{10}$/,
              message: "Mobile must be maximum 10 digit & must be numeric!",
            },
          })}
          onInput={(e) => {
            e.target.value = String(e.target.value || "")
              .replace(/\D/g, "")
              .slice(0, 10);
          }}
          className={cn(
            styles.inputBase,
            errors.telephone ? styles.inputError : ""
          )}
        />
      </Field>

      <Field label="Subject" required error={errors.subject?.message}>
        <Input
          placeholder="Example: Login issue / Billing / Store setup"
          {...register("subject", {
            required: "Subject must be between 3 and 80 characters!",
            minLength: {
              value: 3,
              message: "Subject must be between 3 and 80 characters!",
            },
            maxLength: {
              value: 80,
              message: "Subject must be between 3 and 80 characters!",
            },
          })}
          className={cn(
            styles.inputBase,
            errors.subject ? styles.inputError : ""
          )}
        />
      </Field>

      <Field label="Message" required error={errors.message?.message}>
        <Textarea
          placeholder="Write your message here..."
          className={cn(
            styles.textareaBase,
            errors.message ? styles.inputError : ""
          )}
          {...register("message", {
            required: "Message must be between 10 and 2000 characters!",
            minLength: {
              value: 10,
              message: "Message must be between 10 and 2000 characters!",
            },
            maxLength: {
              value: 2000,
              message: "Message must be between 10 and 2000 characters!",
            },
          })}
        />
        <p className={styles.helpText}>
          Please include your affiliate ID, error message, and steps that caused
          the issue.
        </p>
      </Field>

      <div className={styles.submitBox}>
        <p className={`${styles.submitText} hidden sm:block`}>
          By submitting, you agree to be contacted by {storeName}.
        </p>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitBtn}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </form>
  );
}