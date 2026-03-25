"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import styles from "./AccountSubnav.module.css";

const items = [
  {
    href: "/account",
    label: "Dashboard",
    icon: "home",
  },
  {
    href: "/account/invoices",
    label: "Invoices",
    icon: "file-invoice",
  },
  {
    href: "/account/credit-cards",
    label: "Payment Method",
    icon: "credit-card",
  },
  {
    href: "/account/profile",
    label: "Profile",
    icon: "user",
  },
  {
    href: "/contact",
    label: "Support",
    icon: "life-ring",
  },
];

export default function AccountSubnav({ active = "" }) {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const activeHref = useMemo(() => {
    if (active) return active;
    return pathname || "/account";
  }, [active, pathname]);

  const activeItem = useMemo(() => {
    return (
      items.find((item) => item.href === activeHref) ||
      items.find((item) => activeHref.startsWith(item.href)) ||
      items[0]
    );
  }, [activeHref]);

  function handleCloseMenu() {
    setOpen(false);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const res = await fetch("/account/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Logout failed");
      }

      window.location.href = "/account/login";
    } catch (e) {
      console.error("Logout failed:", e);
      setLoggingOut(false);
      alert("Logout failed. Please try again.");
    }
  }

  return (
    <div className={styles.wrap}>
      {/* Desktop / Tablet */}
      <div className={cn(styles.desktopNav, "hidden md:flex")}>
        {items.map((item) => {
          const isActive = activeHref === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                styles.desktopLink,
                isActive && styles.desktopLinkActive
              )}
            >
              <i
                className={cn(`fa fa-${item.icon}`, styles.desktopLinkIcon)}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          disabled={loggingOut}
          className={styles.logoutButton}
        >
          <i
            className={cn("fa fa-sign-out", styles.desktopLinkIcon)}
            aria-hidden="true"
          />
          <span>{loggingOut ? "Logging out..." : "Logout"}</span>
        </Button>
      </div>

      {/* Mobile */}
      <div className={cn(styles.mobileNav, "md:hidden")}>
        <div className={styles.mobileBar}>
          <div className={styles.mobileCurrent}>
            <i
              className={cn(`fa fa-${activeItem.icon}`, styles.mobileCurrentIcon)}
              aria-hidden="true"
            />
            <span>{activeItem.label}</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen((prev) => !prev)}
            className={styles.mobileToggle}
            aria-expanded={open}
            aria-label="Toggle account navigation"
          >
            <i
              className={cn(
                "fa",
                open ? "fa-times" : "fa-bars",
                styles.mobileToggleIcon
              )}
              aria-hidden="true"
            />
          </Button>
        </div>

        {open ? (
          <div className={styles.mobileMenu}>
            {items.map((item) => {
              const isActive = activeHref === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleCloseMenu}
                  className={cn(
                    styles.mobileMenuLink,
                    isActive && styles.mobileMenuLinkActive
                  )}
                >
                  <span className={styles.mobileMenuLinkLeft}>
                    <i
                      className={cn(`fa fa-${item.icon}`, styles.mobileMenuLinkIcon)}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </span>

                  <i
                    className={cn("fa fa-angle-right", styles.mobileMenuArrow)}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className={cn(styles.mobileMenuLink, styles.mobileLogoutButton)}
            >
              <span className={styles.mobileMenuLinkLeft}>
                <i
                  className={cn("fa fa-sign-out", styles.mobileMenuLinkIcon)}
                  aria-hidden="true"
                />
                <span>{loggingOut ? "Logging out..." : "Logout"}</span>
              </span>

              <i
                className={cn("fa fa-angle-right", styles.mobileMenuArrow)}
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}