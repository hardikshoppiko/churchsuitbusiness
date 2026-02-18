"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const Z_OVERLAY = "z-[2147483646]"; // ✅ almost max int
const Z_CONTENT = "z-[2147483647]"; // ✅ max int

const DialogOverlay = React.forwardRef(function DialogOverlay(
  { className, ...props },
  ref
) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm",
        Z_OVERLAY,

        // animation
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",

        className
      )}
      {...props}
    />
  );
});

const DialogContent = React.forwardRef(function DialogContent(
  { className, children, showClose = true, ...props },
  ref
) {
  return (
    <DialogPortal>
      <DialogOverlay />

      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed bg-background shadow-lg focus:outline-none",
          Z_CONTENT,

          // Desktop center
          "left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6",
          "max-h-[90vh] overflow-y-auto",

          // ✅ Mobile full-screen
          "max-sm:inset-0 max-sm:left-0 max-sm:top-0 max-sm:max-w-none",
          "max-sm:translate-x-0 max-sm:translate-y-0",
          "max-sm:h-[100dvh] max-sm:w-[100vw] max-sm:rounded-none max-sm:border-0",
          "max-sm:p-4 max-sm:pt-6",
          "max-sm:overflow-y-auto",

          // animation
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",

          className
        )}
        {...props}
      >
        {children}

        {showClose ? (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground">
            ✕
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
);

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);

const DialogTitle = React.forwardRef(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
});

const DialogDescription = React.forwardRef(function DialogDescription(
  { className, ...props },
  ref
) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};