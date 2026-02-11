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
      ? "border-green-200 bg-green-50 text-green-700"
      : s === "open"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : s === "void"
      ? "border-slate-200 bg-slate-50 text-slate-700"
      : "border-border bg-muted/40 text-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {s || "unknown"}
    </span>
  );
}

async function fetchInvoices() {
  const h = await headers();
  const cookieHeader = h.get("cookie") || "";

  const res = await fetch(`${process.env.APP_URL}/api/affiliate/invoices`, {
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
      {/* show text only on md+ */}
      <span className="hidden md:inline">{label}</span>
    </span>
  ) : (
    <span>{label}</span>
  );

  // When disabled, wrap trigger in span (Radix requirement)
  const trigger = (
    <TooltipTrigger asChild>
      <span className={disabled ? "inline-flex cursor-not-allowed" : "inline-flex"}>
        {href && !disabled ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            download={!!download}
            className="inline-flex text-decoration-none text-dark"
          >
            <Button variant="outline" size="sm">
              {content}
            </Button>
          </a>
        ) : (
          <Button variant="outline" size="sm" disabled>
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

  const hostedUrl = inv.hosted_invoice_url || "";
  const pdfUrl = inv.invoice_pdf || "";

  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{number}</div>
          <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(created, { unixSeconds: true, withTime: true })}</div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Total</div>
        <div className="text-base font-semibold">{moneyFromCents(totalCents)}</div>
      </div>

      <div className="mt-4 flex gap-2">
        {/* <ActionBtn
          href={hostedUrl}
          disabled={!hostedUrl}
          label="View"
          icon="eye"
          tooltip={hostedUrl ? "Open invoice" : "Hosted invoice link not available"}
        /> */}

        <ActionBtn
          href={pdfUrl}
          download
          disabled={!pdfUrl}
          label="PDF"
          icon="download"
          tooltip={pdfUrl ? "Download invoice PDF" : "Invoice PDF not available"}
        />
      </div>
    </div>
  );
}

export default async function InvoicesPage() {
  const data = await fetchInvoices();
  const invoices = Array.isArray(data?.invoices) ? data.invoices : [];

  if (!data?.ok) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">Your subscription billing history.</p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {data?.message || "Failed to load invoices"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">Your subscription billing history.</p>
        </div>

        <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{invoices.length}</span>
        </div>
      </div>

      <TooltipProvider delayDuration={150}>
        {invoices.length === 0 ? (
          <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            No invoices found.
          </div>
        ) : (
          <>
            {/* ✅ Mobile view (cards) */}
            <div className="space-y-3 md:hidden">
              {invoices.map((inv) => (
                <InvoiceCard key={inv.id} inv={inv} />
              ))}
            </div>

            {/* ✅ Desktop view (table) */}
            <div className="hidden md:block">
              <div className="rounded-xl border bg-background">
                <div className="w-full overflow-x-auto">
                  {/* force horizontal scroll on smaller screens */}
                  <div className="min-w-[900px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">Invoice #</TableHead>
                          <TableHead className="text-center">Date</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Total</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
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

                          const hostedUrl = inv.hosted_invoice_url || "";
                          const pdfUrl = inv.invoice_pdf || "";

                          return (
                            <TableRow key={id}>
                              <TableCell className="text-center font-medium">{number}</TableCell>

                              <TableCell className="text-center text-sm text-muted-foreground">
                                {formatDateTime(created, { unixSeconds: true, withTime: true })}
                              </TableCell>

                              <TableCell className="text-center">
                                <StatusBadge status={status} />
                              </TableCell>

                              <TableCell className="text-center font-semibold">
                                {moneyFromCents(totalCents)}
                              </TableCell>

                              <TableCell className="text-center">
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                  {/* <ActionBtn
                                    href={hostedUrl}
                                    disabled={!hostedUrl}
                                    label="View"
                                    icon="eye"
                                    tooltip={hostedUrl ? "Open invoice" : "Hosted invoice link not available"}
                                  /> */}

                                  <ActionBtn
                                    href={pdfUrl}
                                    download
                                    disabled={!pdfUrl}
                                    label=""
                                    icon="download"
                                    tooltip={pdfUrl ? "Download invoice PDF" : "Invoice PDF not available"}
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
    </div>
  );
}