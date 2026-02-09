import PaymentClient from "./payment-client";
import { getAffiliate } from "@/lib/affiliate";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const metadata = {
  title: "Affiliate Website Program Payment",
  description:
    "Website Affiliate Program at Ladies Church Suits,Earn money by selling church attire,wholesale church suits,Free Website Program,Buid your website in free",
};

export default async function PaymentPage({ params }) {
  // ✅ Next.js: params can be a Promise
  const { affiliate_id } = await params;

  const affiliateId = Number(affiliate_id);
  const affiliate_info = await getAffiliate(affiliateId);

  let telephone = affiliate_info?.telephone || "";
  if (telephone && telephone.length > 10) {
    telephone = telephone
      .split("")
      .reverse()
      .join("")
      .substring(0, 10)
      .split("")
      .reverse()
      .join("");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 lg:py-12">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl border bg-background p-6 shadow-sm lg:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]">
          <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Final step
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Complete Subscription Payment
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Review your store details and activate your subscription securely.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-5">
        {/* Left: Store Details */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Store Details</CardTitle>
              <CardDescription>
                Please confirm the information below before paying.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="text-xs font-semibold text-muted-foreground">
                  Store Name
                </div>
                <div className="mt-1 font-semibold">
                  {affiliate_info?.store_name || "-"}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Email
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {affiliate_info?.email ? (
                      <a
                        className="underline underline-offset-4"
                        href={`mailto:${affiliate_info.email}`}
                      >
                        {affiliate_info.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Phone / Mobile
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {telephone ? (
                      <a
                        className="underline underline-offset-4"
                        href={`tel:+1${telephone}`}
                      >
                        {affiliate_info?.telephone}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-primary/5 p-4">
                <div className="text-sm font-semibold">Secure Payment</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Payments are processed by Stripe. Your card details are never
                  stored on our server.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Payment */}
        <div className="lg:col-span-3">
          <PaymentClient affiliateId={affiliateId} />
        </div>
      </div>
    </main>
  );
}