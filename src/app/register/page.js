import RegisterWizardForm from "./RegisterWizardForm";
import { getAffiliatePlans } from "@/lib/affiliate";
import { getCountries } from "@/lib/geo";
import { getSiteSettings } from "@/lib/settings";

export const metadata = {
  title: "Affiliate Website Program, Start Selling Church Suits Online",
  description:
    "Website Affiliate Program at Ladies Church Suits,Earn money by selling church attire,wholesale church suits,Free Website Program,Buid your website in free",
};

export default async function RegisterPage() {
  const [plans, countries, settings] = await Promise.all([
    getAffiliatePlans(),
    getCountries(),
    getSiteSettings(0),
  ]);

  const defaultCountryId = Number(settings?.config?.config_country_id || 0) || 0;
  const defaultZoneId = Number(settings?.config?.config_zone_id || 0) || 0;

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
            3-step quick registration
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            New Affiliate / Dropshipping Registration
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Complete the registration in 3 simple steps to create your store and
            start selling online.
          </p>

          {/* Small stats row */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <div className="text-xs font-semibold text-muted-foreground">Step 1</div>
              <div className="mt-1 font-semibold">Personal Info</div>
              <div className="text-sm text-muted-foreground">Basic details</div>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-4">
              <div className="text-xs font-semibold text-muted-foreground">Step 2</div>
              <div className="mt-1 font-semibold">Plan & Domain</div>
              <div className="text-sm text-muted-foreground">Select plan + website</div>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-4">
              <div className="text-xs font-semibold text-muted-foreground">Step 3</div>
              <div className="mt-1 font-semibold">Address & Password</div>
              <div className="text-sm text-muted-foreground">Finish & pay</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <div className="mt-6 lg:mt-8">
        <RegisterWizardForm
          plans={plans}
          countries={countries}
          defaultCountryId={defaultCountryId}
          defaultZoneId={defaultZoneId}
        />
      </div>
    </main>
  );
}