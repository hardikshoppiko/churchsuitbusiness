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
  DropdownMenuLabel,
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

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const settings = useSelector((state) => state.settings?.data || {});
  const siteName =
    settings?.config?.config_name ||
    settings?.config?.config_store ||
    "MyAffiliate";

  const logo =
    "https://weshipfashions.com/image/catalog/logo/weshipfashions-logo.png";

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // ✅ re-check when route changes (after login redirect)
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

  // console.log("NODE_ENV:", process.env.NODE_ENV);

  return (
    <header className="sticky-top bg-white border-bottom">
      <nav className="navbar navbar-light bg-white py-2">
        <div className="container d-flex align-items-center justify-content-between">
          {/* Brand */}
          <Link href={homeHref} className="navbar-brand d-flex align-items-center gap-2">
            <img
              src={logo}
              alt={siteName}
              style={{ height: 34, width: "auto" }}
            />
            <span className="d-none d-md-inline fw-bold">{siteName}</span>
          </Link>

          {/* Right Actions */}
          <div className="d-flex align-items-center gap-2">
            {/* Desktop actions */}
            <div className="d-none d-md-flex align-items-center gap-2">
              {!loggedIn ? (
                <>
                  <Link href="/account/login" className="text-decoration-none text-dark">
                    <Button variant="outline">Login</Button>
                  </Link>

                  <Link href="/register" className="text-decoration-none">
                    <Button>Register</Button>
                  </Link>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-full px-4">
                      {user?.firstname ? `Hi, ${user.firstname}` : "My Account"}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={10}
                    className="
                      w-56 overflow-hidden rounded-xl border bg-white p-1 shadow-lg
                      text-sm
                    "
                  >
                    <div className="px-2 py-2">
                      <div className="text-xs font-semibold text-slate-500">Account</div>
                      <div className="text-sm font-medium text-slate-900">
                        {user?.firstname ? `${user.firstname} ${user.lastname || ""}`.trim() : "My Account"}
                      </div>
                    </div>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account"
                        className="
                          flex w-full items-center gap-2 rounded-lg px-2 py-2
                          no-underline text-slate-900
                          hover:bg-slate-100 cursor-pointer text-decoration-none text-dark
                        "
                      >
                        <i className="fa-solid fa-gauge" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/profile"
                        className="
                          flex w-full items-center gap-2 rounded-lg px-2 py-2
                          no-underline text-slate-900
                          hover:bg-slate-100 cursor-pointer text-decoration-none text-dark
                        "
                      >
                        <i className="fa-solid fa-user" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/invoices"
                        className="
                          flex w-full items-center gap-2 rounded-lg px-2 py-2
                          no-underline text-slate-900
                          hover:bg-slate-100 cursor-pointer text-decoration-none text-dark
                        "
                      >
                        <i className="fa-solid fa-file-invoice" />
                        Invoices
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/credit-cards"
                        className="
                          flex w-full items-center gap-2 rounded-lg px-2 py-2
                          no-underline text-slate-900
                          hover:bg-slate-100 cursor-pointer text-decoration-none text-dark
                        "
                      >
                        <i className="fa-solid fa-credit-card" />
                        Credit Cards
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      onClick={logout}
                      className="
                        flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2
                        text-red-600 hover:bg-red-50 focus:bg-red-50
                      "
                    >
                      <i className="fa-solid fa-right-from-bracket" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile menu (shadcn Sheet) */}
            <div className="d-md-none">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Menu">
                    <i className="fa-solid fa-bars" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-[320px] sm:w-[360px]">
                  <SheetHeader>
                    <SheetTitle>{siteName}</SheetTitle>
                  </SheetHeader>

                  <div className="mt-4">
                    {loggedIn ? (
                      <>
                        <div className="mb-4">
                          <div className="fw-semibold">
                            {user?.firstname
                              ? `${user.firstname} ${user.lastname || ""}`.trim()
                              : "My Account"}
                          </div>
                          <div className="text-muted small">{user?.email || ""}</div>
                        </div>

                        <div className="d-grid gap-2">
                          <Link href="/account" onClick={() => setSheetOpen(false)}>
                            <Button variant="outline" className="w-100 justify-content-start">
                              Dashboard
                            </Button>
                          </Link>

                          <Link href="/account/profile" onClick={() => setSheetOpen(false)}>
                            <Button variant="outline" className="w-100 justify-content-start">
                              Profile
                            </Button>
                          </Link>

                          <Link href="/account/invoices" onClick={() => setSheetOpen(false)}>
                            <Button variant="outline" className="w-100 justify-content-start">
                              Invoices
                            </Button>
                          </Link>

                          <Link href="/account/credit-cards" onClick={() => setSheetOpen(false)}>
                            <Button variant="outline" className="w-100 justify-content-start">
                              Credit Cards
                            </Button>
                          </Link>

                          <Button variant="destructive" onClick={logout} className="w-100">
                            Logout
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="d-grid gap-2">
                        <Link href="/account/login" onClick={() => setSheetOpen(false)}>
                          <Button variant="outline" className="w-100">
                            Login
                          </Button>
                        </Link>

                        <Link href="/register" onClick={() => setSheetOpen(false)}>
                          <Button className="w-100">Register</Button>
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