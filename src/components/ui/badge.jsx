import * as React from "react";
import { cn } from "@/lib/db-utils";

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variant === "default" && "bg-primary text-primary-foreground border-transparent",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "bg-background text-foreground",
        className
      )}
      {...props}
    />
  );
}