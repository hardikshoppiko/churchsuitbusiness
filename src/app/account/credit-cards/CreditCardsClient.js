"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

import styles from "./CreditCardsClient.module.css";

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

  return null;
}

function sortCards(list, defaultPaymentMethod) {
  const def = String(defaultPaymentMethod || "");

  return (Array.isArray(list) ? list : []).slice().sort((a, b) => {
    const aIsDefault = String(a?.id || "") === def ? 0 : 1;
    const bIsDefault = String(b?.id || "") === def ? 0 : 1;
    return aIsDefault - bIsDefault;
  });
}

function Pill({ children, tone = "default" }) {
  const cls =
    tone === "success"
      ? styles.pillSuccess
      : tone === "warning"
      ? styles.pillWarning
      : styles.pillDefault;

  return <span className={`${styles.pill} ${cls}`}>{children}</span>;
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
      ? styles.actionDanger
      : tone === "primary"
      ? styles.actionPrimary
      : styles.actionDefault;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={disabled ? "inline-flex cursor-not-allowed" : "inline-flex"}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={disabled ? undefined : onClick}
            className={`${styles.actionBtn} ${btnClass}`}
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
    <div className={styles.mobileCard}>
      <div className={styles.mobileCardHeader}>
        <div className={styles.mobileCardBrandWrap}>
          <div className={styles.cardIcon}>
            <i
              className={icon ? `fa-brands fa-${icon}` : "fa fa-credit-card"}
              aria-hidden="true"
            />
          </div>

          <div className={styles.mobileCardMeta}>
            <div className={styles.mobileBrandTitleRow}>
              <div className={styles.mobileBrand}>{brand}</div>

              {isDefault ? (
                <Pill tone="success">
                  <span className={styles.defaultDot} />
                  Default
                </Pill>
              ) : null}
            </div>

            <div className={styles.mobileCardNumber}>{last4}</div>
            <div className={styles.mobileCardExpiry}>Exp {exp}</div>
          </div>
        </div>

        <div className={styles.mobileSavedWrap}>
          <Pill>Saved</Pill>
        </div>
      </div>

      <div className={styles.mobileCardFooter}>
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

export default function CreditCardsClient({ initialData }) {
  const router = useRouter();
  const { toast } = useToast();

  const usedInitialDataRef = useRef(false);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [defaultPm, setDefaultPm] = useState("");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPmId, setConfirmPmId] = useState("");
  const [confirmIsDefault, setConfirmIsDefault] = useState(false);

  async function loadCards(forceFresh = false) {
    setLoading(true);
    setErr("");

    try {
      if (
        !forceFresh &&
        !usedInitialDataRef.current &&
        initialData &&
        typeof initialData === "object" &&
        Array.isArray(initialData.cards)
      ) {
        const def = String(initialData.default_payment_method || "");
        const sorted = sortCards(initialData.cards, def);

        setCards(sorted);
        setDefaultPm(def);
        usedInitialDataRef.current = true;
        return;
      }

      const res = await fetch("/api/affiliate/credit-cards", {
        method: "GET",
        cache: "no-store",
      });

      const j = await res.json().catch(() => ({}));
      if (!j?.ok) {
        throw new Error(j?.message || "Failed to load cards");
      }

      const def = String(j.default_payment_method || "");
      const list = Array.isArray(j.cards) ? j.cards : [];
      const sorted = sortCards(list, def);

      setCards(sorted);
      setDefaultPm(def);
      usedInitialDataRef.current = true;
    } catch (e) {
      setErr(String(e?.message || "Failed to load cards"));
      setCards([]);
      setDefaultPm("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCards(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasCards = cards.length > 0;
  const totalCards = cards.length;
  const defaultCard = cards.find(
    (c) => String(c.id || "") === String(defaultPm || "")
  );

  async function makeDefault(pmId) {
    if (!pmId) return;

    setBusyId(pmId);
    setErr("");

    try {
      const res = await fetch("/api/affiliate/credit-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "set_default",
          payment_method: pmId,
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!j?.ok) {
        throw new Error(j?.message || "Failed to set default");
      }

      await loadCards(true);

      toast({
        title: "Default card updated",
        description: "Subscription billing will use this card.",
        position: "bottom-center",
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
      setErr(
        "Default card cannot be removed. Please set another card as default first."
      );
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
        body: JSON.stringify({
          action: "remove",
          payment_method: pmId,
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!j?.ok) {
        throw new Error(j?.message || "Failed to remove card");
      }

      await loadCards(true);

      toast({
        title: "Card removed",
        position: "bottom-center",
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

    await loadCards(true);

    toast({
      title: "Card added",
      description: "New card saved and set as default.",
      position: "bottom-center",
    });

    setTimeout(() => {
      router.refresh();
    }, 150);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbarCard}>
        <div className={styles.toolbarLeft}>
          <div className={styles.toolbarTitle}>Saved Cards</div>
          <div className={styles.toolbarDesc}>
            Choose which card should be used for subscription billing.
          </div>
        </div>

        <Button onClick={() => setOpen(true)} className={styles.addButton}>
          <i className="fa fa-plus mr-2" aria-hidden="true" />
          Add New Card
        </Button>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Cards</div>
          <div className={styles.summaryValue}>{loading ? "—" : totalCards}</div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Default Card</div>
          <div className={styles.summaryValueSmall}>
            {loading
              ? "Loading..."
              : defaultCard
              ? `${cardBrandLabel(defaultCard.brand)} •••• ${
                  defaultCard.last4 || ""
                }`
              : "Not set"}
          </div>
        </div>
      </div>

      {err ? <div className={styles.errorBox}>{err}</div> : null}

      <TooltipProvider delayDuration={120}>
        <div className="hidden sm:block">
          <div className={styles.tableCard}>
            {loading ? (
              <div className={styles.stateBox}>Loading cards...</div>
            ) : !hasCards ? (
              <div className={styles.stateBox}>
                No cards found. Click <b>Add New Card</b> to save a card.
              </div>
            ) : (
              <div className={styles.tableScroller}>
                <Table>
                  <TableHeader>
                    <TableRow className={styles.tableHeadRow}>
                      <TableHead className={`${styles.tableHeadCell} text-center`}>
                        Card
                      </TableHead>
                      <TableHead className={`${styles.tableHeadCell} text-center`}>
                        Expiry
                      </TableHead>
                      <TableHead className={`${styles.tableHeadCell} text-center`}>
                        Default
                      </TableHead>
                      <TableHead className={`${styles.tableHeadCell} text-center`}>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {cards.map((c) => {
                      const pmId = String(c.id || "");
                      const brand = cardBrandLabel(c.brand);
                      const last4 = c.last4 ? `•••• ${c.last4}` : "—";
                      const exp = fmtExp(c);

                      const isDefault = !!(defaultPm && pmId && defaultPm === pmId);
                      const isBusy = busyId === pmId;
                      const icon = brandIcon(brand);

                      return (
                        <TableRow key={pmId} className={styles.tableBodyRow}>
                          <TableCell className={`${styles.tableCell} text-center`}>
                            <div className={styles.desktopCardCell}>
                              <div className={styles.cardIcon}>
                                <i
                                  className={
                                    icon
                                      ? `fa-brands fa-${icon}`
                                      : "fa fa-credit-card"
                                  }
                                  aria-hidden="true"
                                />
                              </div>

                              <div className={styles.desktopCardText}>
                                <div className={styles.desktopCardBrand}>
                                  {brand}
                                </div>
                                <div className={styles.desktopCardLast4}>
                                  {last4}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className={`${styles.tableCell} text-center`}>
                            <span className={styles.tableMuted}>{exp}</span>
                          </TableCell>

                          <TableCell className={`${styles.tableCell} text-center`}>
                            {isDefault ? (
                              <Pill tone="success">Yes</Pill>
                            ) : (
                              <span className={styles.tableDash}>—</span>
                            )}
                          </TableCell>

                          <TableCell className={`${styles.tableCell} text-center`}>
                            <div className={styles.desktopActions}>
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
        </div>

        <div className="sm:hidden">
          {loading ? (
            <div className={styles.mobileStateCard}>Loading cards...</div>
          ) : !hasCards ? (
            <div className={styles.mobileStateCard}>
              No cards found. Tap <b>Add New Card</b> to save a card.
            </div>
          ) : (
            <div className={styles.mobileList}>
              {cards.map((c) => {
                const pmId = String(c.id || "");
                const isDefault = !!(defaultPm && pmId && defaultPm === pmId);
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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-[calc(100%-1rem)] sm:max-w-lg max-sm:max-h-[90dvh] rounded-2xl p-4 sm:p-5 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
              <DialogDescription>
                Enter your card details. After saving, it will become your
                default card.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <AddCardForm onSuccess={handleAdded} onError={(m) => setErr(m)} />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-md max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-[100vw] max-sm:rounded-none max-sm:p-4 max-sm:overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Remove Card?</DialogTitle>
              <DialogDescription>
                This will remove the card from your account. You can add it again
                later.
              </DialogDescription>
            </DialogHeader>

            <div className={styles.confirmActions}>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>

              <Button onClick={removeCardConfirmed} className={styles.removeButton}>
                <i className="fa fa-trash mr-2" aria-hidden="true" />
                Remove
              </Button>
            </div>

            {confirmIsDefault ? (
              <div className={styles.warningBox}>
                Default card cannot be removed. Set another card as default first.
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </div>
  );
}