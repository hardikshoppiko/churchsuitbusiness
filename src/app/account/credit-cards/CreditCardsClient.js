"use client";

import { useEffect, useState } from "react";

import AddCardForm from "./AddCardForm";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useToast } from "@/components/ui/use-toast";

function fmtExp(card) {
  const m = String(card?.exp_month || "").padStart(2, "0");
  const y = String(card?.exp_year || "");
  if (!m || !y) return "—";
  return `${m}/${y}`;
}

function cardBrandLabel(v) {
  const s = String(v || "").toLowerCase();
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function brandIcon(brand) {
  const b = String(brand || "").toLowerCase();

  if (b.includes("visa")) return "cc-visa";
  if (b.includes("master")) return "cc-mastercard";
  if (b.includes("amex")) return "cc-amex";
  if (b.includes("discover")) return "cc-discover";

  return null; // fallback handled in JSX
}

function Pill({ children, tone = "default" }) {
  const cls =
    tone === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-border bg-muted/30 text-muted-foreground";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function ActionBtn({
  disabled,
  onClick,
  label,
  tooltip,
  icon,
  tone = "default",
}) {
  const content = icon ? (
    <i className={`fa fa-${icon}`} aria-hidden="true" />
  ) : (
    label
  );

  const btnClass =
    tone === "danger"
      ? "border-red-200 text-red-700 hover:bg-red-50"
      : tone === "primary"
      ? "border-primary/20 hover:bg-muted/40"
      : "";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={disabled ? "inline-flex cursor-not-allowed" : "inline-flex"}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={disabled ? undefined : onClick}
            className={[
              "gap-2 transition-all duration-150",
              "hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]",
              btnClass,
            ].join(" ")}
          >
            {content}
            {!icon ? null : <span className="sr-only">{label}</span>}
          </Button>
        </span>
      </TooltipTrigger>

      <TooltipContent side="top" align="center">
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function CardRow({ c, isDefault, isBusy, onMakeDefault, onRemove }) {
  const pmId = String(c.id || "");
  const brand = cardBrandLabel(c.brand);
  const last4 = c.last4 ? `•••• ${c.last4}` : "—";
  const exp = fmtExp(c);

  const icon = brandIcon(brand);

  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-muted/30 text-muted-foreground">
            <i
              className={
                icon ? `fa-brands fa-${icon}` : "fa fa-credit-card"
              }
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold">{brand}</div>
              {isDefault ? (
                <Pill tone="success">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-600" />
                  Default
                </Pill>
              ) : null}
            </div>

            <div className="mt-1 text-xs text-muted-foreground break-all">
              {last4} • Exp {exp}
            </div>
          </div>
        </div>

        <div className="text-right">
          <Pill>{pmId ? "Saved" : "—"}</Pill>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <ActionBtn
          disabled={isDefault || isBusy}
          onClick={() => onMakeDefault(pmId)}
          label="Make Default"
          icon="check"
          tooltip={
            isDefault
              ? "This is already your default card"
              : "Set this card as your default payment method"
          }
        />

        <ActionBtn
          disabled={isBusy || isDefault}
          onClick={() => onRemove(pmId, isDefault)}
          label="Remove"
          icon="trash"
          tone="danger"
          tooltip={
            isDefault
              ? "Default card cannot be removed"
              : "Remove this card from your account"
          }
        />
      </div>
    </div>
  );
}

export default function CreditCardsClient() {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [defaultPm, setDefaultPm] = useState("");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState("");

  // confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPmId, setConfirmPmId] = useState("");
  const [confirmIsDefault, setConfirmIsDefault] = useState(false);

  const { toast } = useToast();

  async function loadCards() {
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/affiliate/credit-cards", {
        method: "GET",
        cache: "no-store",
      });

      const j = await res.json().catch(() => ({}));
      if (!j?.ok) throw new Error(j?.message || "Failed to load cards");

      const def = String(j.default_payment_method || "");

      const list = Array.isArray(j.cards) ? j.cards : [];

      // ✅ default card first
      const sorted = list.slice().sort((a, b) => {
        const aIsDefault = String(a?.id || "") === def ? 0 : 1;
        const bIsDefault = String(b?.id || "") === def ? 0 : 1;
        return aIsDefault - bIsDefault;
      });

      setCards(sorted);
      setDefaultPm(def);
    } catch (e) {
      setErr(String(e?.message || "Failed to load cards"));
      setCards([]);
      setDefaultPm("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCards();
  }, []);

  const hasCards = cards && cards.length > 0;

  async function makeDefault(pmId) {
    if (!pmId) return;
    setBusyId(pmId);
    setErr("");
    try {
      const res = await fetch("/api/affiliate/credit-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "set_default", payment_method: pmId }),
      });
      const j = await res.json().catch(() => ({}));
      if (!j?.ok) throw new Error(j?.message || "Failed to set default");
      await loadCards();

      toast({
        title: "Default card updated",
        description: "Subscription billing will use this card.",
        position: "bottom-center"
      });
    } catch (e) {
      setErr(String(e?.message || "Failed to set default"));
    } finally {
      setBusyId("");
    }
  }

  function askRemove(pmId, isDefault) {
    if (!pmId) return;

    if (isDefault) {
      setErr("Default card cannot be removed. Please set another card as default first.");
      return;
    }

    setConfirmPmId(pmId);
    setConfirmIsDefault(!!isDefault);
    setConfirmOpen(true);
  }

  async function removeCardConfirmed() {
    const pmId = confirmPmId;
    if (!pmId) return;

    setConfirmOpen(false);
    setBusyId(pmId);
    setErr("");

    try {
      const res = await fetch("/api/affiliate/credit-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "remove", payment_method: pmId }),
      });
      const j = await res.json().catch(() => ({}));
      if (!j?.ok) throw new Error(j?.message || "Failed to remove card");
      await loadCards();

      toast({
        title: "Card removed",
        position: "bottom-center"
      });
    } catch (e) {
      setErr(String(e?.message || "Failed to remove card"));
    } finally {
      setBusyId("");
      setConfirmPmId("");
      setConfirmIsDefault(false);
    }
  }

  async function handleAdded() {
    setOpen(false);
    await loadCards();

    toast({
      title: "Card added",
      description: "New card saved and set as default.",
      position: "bottom-center"
    });
  }

  return (
      <div className="w-full">
      {/* Premium header */}
      <div className="mb-5 rounded-3xl border bg-background p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment Method</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a new card and set your default card for billing.
            </p>
          </div>

          <Button
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto transition-all duration-150 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]"
          >
            <i className="fa fa-plus mr-2" aria-hidden="true" />
            Add New Card
          </Button>
        </div>
      </div>

      {err ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <TooltipProvider delayDuration={120}>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-hidden rounded-3xl border bg-background shadow-sm">
          {loading ? (
            <div className="p-5 text-sm text-muted-foreground">Loading cards...</div>
          ) : !hasCards ? (
            <div className="p-5 text-sm text-muted-foreground">
              No cards found. Click <b>Add New Card</b> to save a card.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[260px] text-center">Card</TableHead>
                    <TableHead className="min-w-[140px] text-center">Expiry</TableHead>
                    <TableHead className="min-w-[150px] text-center">Default</TableHead>
                    <TableHead className="min-w-[260px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {cards.map((c) => {
                    const pmId = String(c.id || "");
                    const brand = cardBrandLabel(c.brand);
                    const last4 = c.last4 ? `•••• ${c.last4}` : "—";
                    const exp = fmtExp(c);

                    const isDefault = defaultPm && pmId && defaultPm === pmId;
                    const isBusy = busyId === pmId;

                    const icon = brandIcon(brand);

                    // console.log(icon);

                    return (
                      <TableRow key={pmId}>
                        <TableCell className="font-semibold text-center">
                          <div className="flex justify-center items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-muted/30 text-muted-foreground">
                              <i
                                className={
                                  icon ? `fa-brands fa-${icon}` : "fa fa-credit-card"
                                }
                                aria-hidden="true"
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="text-xs text-muted-foreground">{last4}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground text-center">{exp}</TableCell>

                        <TableCell className="text-center">
                          {isDefault ? (
                            <Pill tone="success">Yes</Pill>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex flex-wrap justify-center gap-2">
                            <ActionBtn
                              disabled={isDefault || isBusy}
                              onClick={() => makeDefault(pmId)}
                              label="Make Default"
                              icon="check"
                              tooltip={
                                isDefault
                                  ? "This is already your default card"
                                  : "Set this card as your default payment method"
                              }
                            />

                            <ActionBtn
                              disabled={isBusy || isDefault}
                              onClick={() => askRemove(pmId, isDefault)}
                              label="Remove"
                              icon="trash"
                              tone="danger"
                              tooltip={
                                isDefault
                                  ? "Default card cannot be removed"
                                  : "Remove this card from your account"
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden">
          {loading ? (
            <div className="rounded-3xl border bg-background p-5 text-sm text-muted-foreground shadow-sm">
              Loading cards...
            </div>
          ) : !hasCards ? (
            <div className="rounded-3xl border bg-background p-5 text-sm text-muted-foreground shadow-sm">
              No cards found. Tap <b>Add New Card</b> to save a card.
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((c) => {
                const pmId = String(c.id || "");
                const isDefault = defaultPm && pmId && defaultPm === pmId;
                const isBusy = busyId === pmId;

                return (
                  <CardRow
                    key={pmId}
                    c={c}
                    isDefault={isDefault}
                    isBusy={isBusy}
                    onMakeDefault={makeDefault}
                    onRemove={askRemove}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Add Card dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-xl max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-[100vw] max-sm:rounded-none max-sm:p-4 max-sm:overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
              <DialogDescription>
                Enter your card details. After saving, it will become your default card.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <AddCardForm onSuccess={handleAdded} onError={(m) => setErr(m)} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Remove confirmation dialog */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-md max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-[100vw] max-sm:rounded-none max-sm:p-4 max-sm:overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Remove Card?</DialogTitle>
              <DialogDescription>
                This will remove the card from your account. You can add it again later.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>

              <Button
                onClick={removeCardConfirmed}
                className="transition-all duration-150 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]"
              >
                <i className="fa fa-trash mr-2" aria-hidden="true" />
                Remove
              </Button>
            </div>

            {confirmIsDefault ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Default card cannot be removed. Set another card as default first.
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </div>
  );
}