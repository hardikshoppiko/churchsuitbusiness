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
    href: "/account/profile",
    label: "Profile",
    icon: "user",
  },
  {
    href: "/contact",
    label: "Support",
    icon: "life-ring",
  },
  {
    href: "/account/logout",
    label: "Logout",
    icon: "sign-out",
    danger: true,
  },
];

export default function AccountSubnav({ active = "" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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

  return (
    <div className={styles.wrap}>
      {/* Desktop / Tablet */}
      <div className={cn(styles.desktopNav, "hidden md:flex")}>
        {items.map((item) => {
          const isActive = activeHref === item.href;
          const isDanger = !!item.danger;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                styles.desktopLink,
                isActive && styles.desktopLinkActive,
                isDanger && !isActive && styles.desktopLinkDanger
              )}
            >
              <i
                className={cn(
                  `fa fa-${item.icon}`,
                  styles.desktopLinkIcon
                )}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile */}
      <div className={cn(styles.mobileNav, "md:hidden")}>
        <div className={styles.mobileBar}>
          <div className={styles.mobileCurrent}>
            <i
              className={cn(
                `fa fa-${activeItem.icon}`,
                styles.mobileCurrentIcon
              )}
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
              const isDanger = !!item.danger;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleCloseMenu}
                  className={cn(
                    styles.mobileMenuLink,
                    isActive && styles.mobileMenuLinkActive,
                    isDanger && !isActive && styles.mobileMenuLinkDanger
                  )}
                >
                  <span className={styles.mobileMenuLinkLeft}>
                    <i
                      className={cn(
                        `fa fa-${item.icon}`,
                        styles.mobileMenuLinkIcon
                      )}
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
          </div>
        ) : null}
      </div>
    </div>
  );
}