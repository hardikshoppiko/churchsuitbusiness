import { headers } from "next/headers";

import CreditCardsClient from "./CreditCardsClient";

export const metadata = {
  title: `Credit Cards | ${process.env.STORE_NAME} Affiliate Program`,
  description: `Manage your saved credit cards for billing in the ${process.env.STORE_NAME} Affiliate Program. Add new cards, remove old ones, and set your default payment method for seamless transactions.`,
};

async function fetchCards() {
  const h = await headers();
  const cookieHeader = h.get("cookie") || "";

  const res = await fetch(`${process.env.APP_URL}/api/affiliate/credit-cards`, {
    method: "GET",
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  const data = await res.json().catch(() => ({}));
  return data;
}

export default async function CreditCardsPage() {
  const data = await fetchCards();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Credit Cards</h1>
        <p className="text-sm text-muted-foreground">
          Add a new card and set your default card for billing.
        </p>
      </div>

      <CreditCardsClient initialData={data} />
    </div>
  );
}