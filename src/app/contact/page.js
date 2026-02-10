import { getSiteSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import ContactForm from "./ContactForm";

export const metadata = {
  title: `Contact Us | ${process.env.STORE_NAME} Affiliate Program`,
  description: `Have questions or need support? Contact the ${process.env.STORE_NAME} affiliate team for assistance with your account, billing, or store setup.`,
};

function safeStr(v) {
  return String(v || "").trim();
}

export default async function ContactPage() {
  const [settingsData, session] = await Promise.all([
    getSiteSettings(0),
    getSession(),
  ]);

  const storeName = safeStr(settingsData?.config?.config_name) || "Church Suits Business";
  const storeEmail = safeStr(settingsData?.config?.config_email) || "info@designerchurchsuits.com";
  const storeTelephone = safeStr(settingsData?.config?.config_telephone) || "—";
  const storeAddress = safeStr(settingsData?.config?.config_address) || "—";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border bg-background p-6 shadow-sm lg:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]">
          <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            We usually reply within 24 hours
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Contact Us</h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Need help with your affiliate account, billing, or store setup? Send us a message.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Form */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>
              {session?.firstname
                ? `Hi ${session.firstname}, your details are already filled in.`
                : "Fill out the form below and we’ll contact you."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* ✅ Client form with auto-fill */}
            <ContactForm session={session} storeName={storeName} />
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
              <CardDescription>Reach us directly</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="text-xs font-semibold text-muted-foreground">Support Email</div>
                <div className="mt-1 text-sm font-semibold break-all">{storeEmail}</div>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="text-xs font-semibold text-muted-foreground">Phone</div>
                <div className="mt-1 text-sm font-semibold">{storeTelephone}</div>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="text-xs font-semibold text-muted-foreground">Address</div>
                <div className="mt-1 text-sm text-muted-foreground">{storeAddress}</div>
              </div>

              <Separator />

              <div className="rounded-2xl border p-4">
                <div className="text-sm font-semibold">Common Questions</div>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground mb-0 p-0">
                  <li>• Login / password help</li>
                  <li>• Billing & invoices</li>
                  <li>• Domain / website setup</li>
                  <li>• Affiliate account updates</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}