"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import styles from "./header.module.css";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const settings = useSelector((state) => state.settings?.data || {});
  const siteName =
    settings?.config?.config_name ||
    settings?.config?.config_store ||
    "MyAffiliate";

  const logo = "/assets/images/church-suits-business.png";

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function checkSession() {
    try {
      const res = await fetch("/api/account/me", {
        cache: "no-store",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (data?.success && data?.loggedIn) {
        setLoggedIn(true);
        setUser(data.user || null);
      } else {
        setLoggedIn(false);
        setUser(null);
      }
    } catch {
      setLoggedIn(false);
      setUser(null);
    }
  }

  async function logout() {
    await fetch("/api/account/logout", {
      method: "POST",
      credentials: "include",
    });

    setLoggedIn(false);
    setUser(null);
    setSheetOpen(false);
    router.push("/account/login");
  }

  const homeHref = loggedIn ? "/account" : "/";
  const storeNameForTitle = process.env.NEXT_PUBLIC_STORE_NAME || siteName;

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className="container d-flex align-items-center justify-content-between">
          {/* Brand */}
          <Link
            href={homeHref}
            className={`d-flex align-items-center gap-3 text-decoration-none ${styles.brandLink}`}
          >
            <div className={styles.logoWrap}>
              <img
                src={logo}
                alt={storeNameForTitle}
                className={styles.logoImg}
              />
            </div>

            <div className={`d-none d-sm-block ${styles.brandTextWrap}`}>
              <div className={styles.brandTitle}>
                Church Suits Business
              </div>

              <div className={styles.brandSubtitle}>
                Affiliate Fashion Program
              </div>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="d-flex align-items-center gap-2">
            {/* Desktop */}
            <div className="d-none d-md-flex align-items-center gap-2">
              {!loggedIn ? (
                <>
                  <Link
                    href="/account/login"
                    className="text-decoration-none"
                  >
                    <Button
                      variant="outline"
                      className={styles.outlineBtn}
                    >
                      Login
                    </Button>
                  </Link>

                  <Link
                    href="/register"
                    className="text-decoration-none"
                  >
                    <Button className={styles.primaryBtn}>
                      Register
                    </Button>
                  </Link>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={styles.outlineBtn}
                    >
                      {user?.firstname ? `Hi, ${user.firstname}` : "My Account"}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={12}
                    className={styles.dropdownContent}
                  >
                    <div className="px-2 py-2">
                      <div className={styles.dropdownLabel}>
                        Account
                      </div>
                      <div className={styles.dropdownName}>
                        {user?.firstname
                          ? `${user.firstname} ${user.lastname || ""}`.trim()
                          : "My Account"}
                      </div>
                      <div className={styles.dropdownEmail}>
                        {user?.email || ""}
                      </div>
                    </div>

                    <DropdownMenuSeparator className="my-2" />

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account"
                        className={styles.dropdownItemLink}
                      >
                        <i className="fa-solid fa-gauge-high" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/profile"
                        className={styles.dropdownItemLink}
                      >
                        <i className="fa-solid fa-user" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/invoices"
                        className={styles.dropdownItemLink}
                      >
                        <i className="fa-solid fa-file-invoice" />
                        Invoices
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/credit-cards"
                        className={styles.dropdownItemLink}
                      >
                        <i className="fa-solid fa-credit-card" />
                        Payment Method
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-2" />

                    <DropdownMenuItem
                      onClick={logout}
                      className={styles.logoutItem}
                    >
                      <i className="fa-solid fa-right-from-bracket" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile */}
            <div className="d-md-none">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Menu"
                    className={styles.mobileMenuBtn}
                  >
                    <i className="fa-solid fa-bars" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className={styles.sheetContent}
                >
                  <SheetHeader>
                    <SheetTitle className={styles.sheetTitle}>
                      {storeNameForTitle}
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-4">
                    {loggedIn ? (
                      <>
                        <div className={styles.mobileAccountBox}>
                          <div className="fw-semibold">
                            {user?.firstname
                              ? `${user.firstname} ${user.lastname || ""}`.trim()
                              : "My Account"}
                          </div>
                          <div className="text-muted small">
                            {user?.email || ""}
                          </div>
                        </div>

                        <div className="d-grid gap-2">
                          <Link
                            href="/account"
                            onClick={() => setSheetOpen(false)}
                            className="text-decoration-none"
                          >
                            <Button
                              variant="outline"
                              className={styles.mobileOutlineBtn}
                            >
                              Dashboard
                            </Button>
                          </Link>

                          <Link
                            href="/account/profile"
                            onClick={() => setSheetOpen(false)}
                            className="text-decoration-none"
                          >
                            <Button
                              variant="outline"
                              className={styles.mobileOutlineBtn}
                            >
                              Profile
                            </Button>
                          </Link>

                          <Link
                            href="/account/invoices"
                            onClick={() => setSheetOpen(false)}
                            className="text-decoration-none"
                          >
                            <Button
                              variant="outline"
                              className={styles.mobileOutlineBtn}
                            >
                              Invoices
                            </Button>
                          </Link>

                          <Link
                            href="/account/credit-cards"
                            onClick={() => setSheetOpen(false)}
                            className="text-decoration-none"
                          >
                            <Button
                              variant="outline"
                              className={styles.mobileOutlineBtn}
                            >
                              Payment Method
                            </Button>
                          </Link>

                          <Button
                            onClick={logout}
                            className={styles.mobileDangerBtn}
                          >
                            Logout
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="d-grid gap-2">
                        <Link
                          href="/account/login"
                          onClick={() => setSheetOpen(false)}
                          className="text-decoration-none"
                        >
                          <Button
                            variant="outline"
                            className={styles.mobileOutlineBtn}
                          >
                            Login
                          </Button>
                        </Link>

                        <Link
                          href="/register"
                          onClick={() => setSheetOpen(false)}
                          className="text-decoration-none"
                        >
                          <Button className={styles.mobilePrimaryBtn}>
                            Register
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}