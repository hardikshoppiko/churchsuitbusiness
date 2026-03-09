// src/app/account/invoices/page.js
import { headers } from "next/headers";

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

import { formatDateTime } from "@/lib/utils";

import styles from "./page.module.css";

export const metadata = {
  title: `Invoices | ${process.env.STORE_NAME} Affiliate Program`,
  description: `View and manage your ${process.env.STORE_NAME} subscription invoices and billing history.`,
};

function moneyFromCents(amount) {
  const n = Number(amount || 0) / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();

  const cls =
    s === "paid"
      ? styles.statusPaid
      : s === "open"
      ? styles.statusOpen
      : s === "void"
      ? styles.statusVoid
      : styles.statusDefault;

  return <span className={`${styles.statusBadge} ${cls}`}>{s || "unknown"}</span>;
}

async function fetchInvoices() {
  const h = await headers();
  const cookieHeader = h.get("cookie") || "";

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/affiliate/invoices`, {
    method: "GET",
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  const data = await res.json().catch(() => ({}));
  return data;
}

function ActionBtn({ disabled, href, label, tooltip, download, icon }) {
  const hasIcon = !!icon;

  const content = hasIcon ? (
    <span className={`inline-flex items-center ${label ? "gap-2" : ""}`}>
      <i className={`fa fa-${icon}`} aria-hidden="true" />
      <span className="hidden md:inline">{label}</span>
    </span>
  ) : (
    <span>{label}</span>
  );

  const trigger = (
    <TooltipTrigger asChild>
      <span className={disabled ? "inline-flex cursor-not-allowed" : "inline-flex"}>
        {href && !disabled ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            download={!!download}
            className="inline-flex text-decoration-none"
          >
            <Button variant="outline" size="sm" className={styles.actionButton}>
              {content}
            </Button>
          </a>
        ) : (
          <Button variant="outline" size="sm" className={styles.actionButton} disabled>
            {content}
          </Button>
        )}
      </span>
    </TooltipTrigger>
  );

  return (
    <Tooltip>
      {trigger}
      <TooltipContent side="top" align="center">
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function InvoiceCard({ inv }) {
  const id = inv.id;
  const number = inv.number || inv.invoice_number || id;
  const status = inv.status || "";
  const created = inv.created || 0;

  const totalCents = inv.total_cents ?? inv.total ?? inv.amount_due ?? inv.amount_paid ?? 0;

  const pdfUrl = inv.invoice_pdf || "";

  return (
    <div className={styles.invoiceCard}>
      <div className={styles.invoiceCardTop}>
        <div className={styles.invoiceCardMeta}>
          <div className={styles.invoiceNumber}>{number}</div>
          <div className={styles.invoiceDate}>
            {formatDateTime(created, { unixSeconds: true, withTime: true })}
          </div>
        </div>

        <div className={styles.invoiceStatusWrap}>
          <StatusBadge status={status} />
        </div>
      </div>

      <div className={styles.invoiceBottomRow}>
        <div className={styles.invoiceBottomLeft}>
          <div className={styles.invoiceTotalLabel}>Total</div>
          <div className={styles.invoiceTotalValue}>{moneyFromCents(totalCents)}</div>
        </div>

        <div className={styles.invoiceBottomRight}>
          <ActionBtn
            href={pdfUrl}
            download
            disabled={!pdfUrl}
            label=""
            icon="download"
            tooltip={pdfUrl ? "Download invoice PDF" : "Invoice PDF not available"}
          />
        </div>
      </div>
    </div>
  );
}

export default async function InvoicesPage() {
  const data = await fetchInvoices();
  const invoices = Array.isArray(data?.invoices) ? data.invoices : [];

  if (!data?.ok) {
    return (
      <main className={styles.pageWrap}>
        <section className={styles.heroCard}>
          <div className={styles.heroGlow}>
            <div className={styles.heroGlowLeft} />
            <div className={styles.heroGlowRight} />
          </div>

          <div className={styles.heroInner}>
            <div className={styles.heroMobile}>
              <div className={styles.heroMobileTop}>
                <h1 className={styles.heroTitle}>Invoices</h1>
              </div>
              <p className={styles.heroDesc}>Billing history</p>
            </div>

            <div className={styles.heroDesktop}>
              <div className={styles.heroDesktopLeft}>
                <div className={styles.heroBadgeDesktop}>Billing History</div>
                <h1 className={styles.heroTitle}>Invoices</h1>
                <p className={styles.heroDesc}>Your subscription billing history.</p>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.errorBox}>
          {data?.message || "Failed to load invoices"}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.pageWrap}>
      <section className={styles.heroCard}>
        <div className={styles.heroGlow}>
          <div className={styles.heroGlowLeft} />
          <div className={styles.heroGlowRight} />
        </div>

        <div className={styles.heroInner}>
          {/* Mobile */}
          <div className={styles.heroMobile}>
            <div className={styles.heroMobileTop}>
              <h1 className={styles.heroTitle}>Invoices</h1>

              <div className={styles.heroCountBox}>
                Total: <span className={styles.heroCountValue}>{invoices.length}</span>
              </div>
            </div>

            <p className={styles.heroDesc}>Billing history</p>
          </div>

          {/* Desktop */}
          <div className={styles.heroDesktop}>
            <div className={styles.heroDesktopLeft}>
              <div className={styles.heroBadgeDesktop}>Billing History</div>
              <h1 className={styles.heroTitle}>Invoices</h1>
              <p className={styles.heroDesc}>Your subscription billing history.</p>
            </div>

            <div className={styles.heroDesktopRight}>
              <div className={styles.heroCountCard}>
                <div className={styles.heroCountLabel}>Total Invoices</div>
                <div className={styles.heroCountNumber}>{invoices.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TooltipProvider delayDuration={150}>
        {invoices.length === 0 ? (
          <div className={styles.emptyBox}>No invoices found.</div>
        ) : (
          <>
            {/* Mobile */}
            <div className={`md:hidden ${styles.mobileList}`}>
              {invoices.map((inv) => (
                <InvoiceCard key={inv.id} inv={inv} />
              ))}
            </div>

            {/* Desktop */}
            <div className={`hidden md:block ${styles.tableWrapOuter}`}>
              <div className={styles.tableCard}>
                <div className={styles.tableScroller}>
                  <div className={styles.tableMinWidth}>
                    <Table>
                      <TableHeader>
                        <TableRow className={styles.tableHeadRow}>
                          <TableHead className={`${styles.tableHeadCell} text-center`}>
                            Invoice #
                          </TableHead>
                          <TableHead className={`${styles.tableHeadCell} text-center`}>
                            Date
                          </TableHead>
                          <TableHead className={`${styles.tableHeadCell} text-center`}>
                            Status
                          </TableHead>
                          <TableHead className={`${styles.tableHeadCell} text-center`}>
                            Total
                          </TableHead>
                          <TableHead className={`${styles.tableHeadCell} text-center`}>
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {invoices.map((inv) => {
                          const id = inv.id;
                          const number = inv.number || inv.invoice_number || id;
                          const status = inv.status || "";
                          const created = inv.created || 0;

                          const totalCents =
                            inv.total_cents ??
                            inv.total ??
                            inv.amount_due ??
                            inv.amount_paid ??
                            0;

                          const pdfUrl = inv.invoice_pdf || "";

                          return (
                            <TableRow key={id} className={styles.tableBodyRow}>
                              <TableCell className={`${styles.tableCell} text-center font-medium`}>
                                {number}
                              </TableCell>

                              <TableCell className={`${styles.tableCell} text-center`}>
                                <span className={styles.tableDateText}>
                                  {formatDateTime(created, {
                                    unixSeconds: true,
                                    withTime: true,
                                  })}
                                </span>
                              </TableCell>

                              <TableCell className={`${styles.tableCell} text-center`}>
                                <StatusBadge status={status} />
                              </TableCell>

                              <TableCell className={`${styles.tableCell} text-center`}>
                                <span className={styles.tableAmount}>
                                  {moneyFromCents(totalCents)}
                                </span>
                              </TableCell>

                              <TableCell className={`${styles.tableCell} text-center`}>
                                <div className={styles.tableActions}>
                                  <ActionBtn
                                    href={pdfUrl}
                                    download
                                    disabled={!pdfUrl}
                                    label=""
                                    icon="download"
                                    tooltip={
                                      pdfUrl
                                        ? "Download invoice PDF"
                                        : "Invoice PDF not available"
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
                </div>
              </div>
            </div>
          </>
        )}
      </TooltipProvider>
    </main>
  );
}