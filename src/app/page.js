import Link from "next/link";

export const metadata = {
  title: "Affiliate Website Program, Start Selling Church Suits Online",
  description:
    "Website Affiliate Program at Ladies Church Suits, Earn money by selling church attire, wholesale church suits, Free Website Program, Build your website for free.",
};

const FEATURES = [
  {
    title: "Your Own FREE Website",
    desc: "Advanced features & functionalities with reliable hosting.",
    icon: "/assets/images/icons/icon01.png",
  },
  {
    title: "Make Money Immediately",
    desc: "Sales are immediately sent into your bank after each sale.",
    icon: "/assets/images/icons/icon02.png",
  },
  {
    title: "Risk-free Operation",
    desc: "No upfront inventory purchases. Nothing to lose, a lot to gain.",
    icon: "/assets/images/icons/icon03.png",
  },
  {
    title: "No Experience Necessary",
    desc: "We guide you with tips and support to help you succeed.",
    icon: "/assets/images/icons/icon04.png",
  },
  {
    title: "Massive Inventory",
    desc: "Access a large catalog so you never run out of stock.",
    icon: "/assets/images/icons/icon05.png",
  },
  {
    title: "Automated Dropshipping",
    desc: "We handle packing and shipping so you focus on marketing.",
    icon: "/assets/images/icons/icon06.png",
  },
  {
    title: "Technical Support",
    desc: "Work directly with our support team when you need help.",
    icon: "/assets/images/icons/icon07.png",
  },
  {
    title: "Mobile & Tablet Ready",
    desc: "Your customers can shop easily on any device.",
    icon: "/assets/images/icons/icon08.png",
  },
  {
    title: "Social Media Opportunity",
    desc: "Share your store on Facebook, Instagram & more.",
    icon: "/assets/images/icons/icon09.png",
  },
  {
    title: "Become Self-Sufficient",
    desc: "Own your business today and start making money now.",
    icon: "/assets/images/icons/icon10.png",
  },
  {
    title: "No Contract",
    desc: "Cancel anytime. Stay because it works.",
    icon: "/assets/images/icons/icon11.png",
  },
  {
    title: "User Friendly Shopping",
    desc: "A smooth checkout experience that converts visitors.",
    icon: "/assets/images/icons/icon12.png",
  },
];

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      {/* HERO - Fixed banner background */}
      <section className="relative isolate overflow-hidden border-b">
        {/* Background image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/assets/images/0.jpg"
            alt="Affiliate program banner"
            className="h-full w-full object-cover scale-105 blur-sm"
          />

          {/* darker overlay */}
          <div className="absolute inset-0 bg-black/65" />

          {/* gradient fade */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="container py-14 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-3xl text-center text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                FREE Website • Dropshipping • Automated Fulfillment
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
                Start The Dropshipping Website You&apos;ve Dreamed Of
              </h1>

              <p className="mt-4 text-base text-white/80 sm:text-lg">
                Zero risk. Start earning faster with a ready-to-go website, products, and fulfillment — all handled for you.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-white px-7 text-sm font-semibold text-black shadow hover:bg-white/90 no-underline text-decoration-none"
                >
                  Start Your Online Business Now
                </Link>

                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-white/30 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur hover:bg-white/15 text-decoration-none"
                >
                  Create My Affiliate Store
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
                <span>No inventory</span>
                <span className="hidden sm:inline">•</span>
                <span>No setup cost</span>
                <span className="hidden sm:inline">•</span>
                <span>Cancel anytime</span>
              </div>

              <div className="mx-auto mt-10 max-w-4xl">
                <div className="grid gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:grid-cols-3">
                  <div className="rounded-xl bg-black/25 p-4 text-left">
                    <div className="text-sm font-semibold">Fast Setup</div>
                    <div className="mt-1 text-sm text-white/70">
                      Register in minutes. Your store is built in 3 steps.
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/25 p-4 text-left">
                    <div className="text-sm font-semibold">Automatic Fulfillment</div>
                    <div className="mt-1 text-sm text-white/70">
                      We handle packing, shipping, support & returns.
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/25 p-4 text-left">
                    <div className="text-sm font-semibold">Real Profit</div>
                    <div className="mt-1 text-sm text-white/70">
                      You focus on marketing. We handle the rest.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y bg-muted/40">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm font-medium text-muted-foreground mb-6">
            Trusted by 1,500+ fashion sellers & boutique owners
          </p>

          <div className="flex flex-wrap items-center justify-center gap-10 opacity-70">
            <img src="/assets/images/brands/shopify.png" className="h-8 grayscale" />
            <img src="/assets/images/brands/woocommerce.png" className="h-8 grayscale" />
            <img src="/assets/images/brands/stripe.png" className="h-8 grayscale" />
            <img src="/assets/images/brands/paypal.png" className="h-8 grayscale" />
            <img src="/assets/images/brands/ups.png" className="h-8 grayscale" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Loved by successful store owners
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Thousands of sellers run profitable fashion stores using our
              dropshipping platform.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <p className="text-muted-foreground mb-6">
                “I launched my boutique in under a week and started receiving
                orders immediately. No inventory headaches at all.”
              </p>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                  A
                </div>
                <div>
                  <div className="font-semibold">Angela R.</div>
                  <div className="text-sm text-muted-foreground">
                    Boutique Owner, Texas
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <p className="text-muted-foreground mb-6">
                “Their automation handles everything. I focus only on marketing
                and customer growth.”
              </p>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                  M
                </div>
                <div>
                  <div className="font-semibold">Maria G.</div>
                  <div className="text-sm text-muted-foreground">
                    Online Seller, California
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <p className="text-muted-foreground mb-6">
                “Best decision I made. No inventory risk and strong profit
                margins from day one.”
              </p>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                  S
                </div>
                <div>
                  <div className="font-semibold">Samantha L.</div>
                  <div className="text-sm text-muted-foreground">
                    Fashion Store Owner
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="container py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Watch how it works
            </h2>
            <p className="mt-3 text-muted-foreground">
              If you want extra income or your own online business, this program gives you everything needed to start immediately.
            </p>

            <div className="mt-6 space-y-4 text-base text-muted-foreground">
              <p>
                Have you been looking for a way to start making extra income on the side? Or do you want to start your own business but don't know where to start?
              </p>
              <p>
                With our dropshipping program, we provide the store + products + fulfillment. You focus on promoting your website and earning profits.
              </p>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow hover:opacity-95 text-decoration-none text-white"
              >
                Click - Start Your Online Business Now
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/D1QqfxoxYy4"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 0 }}
                  title="Affiliate Program Video"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-t bg-muted/20">
        <div className="container py-10 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              An easy way to make money with a few clicks each day
            </h2>
            <p className="mt-3 text-muted-foreground">
              No inventory, no website setup cost, no employees. We handle the heavy lifting.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Create your own dropshipping website for free",
                desc: "Reliable hosting on our servers with modern store features.",
              },
              {
                title: "Start making money instantly",
                desc: "Once your store is live and you choose products, you can start earning quickly.",
              },
              {
                title: "All the benefits — without the risk",
                desc: "No inventory investment. You have everything to gain.",
              },
              {
                title: "No experience needed",
                desc: "We help you with guidance and support along the way.",
              },
              {
                title: "Large inventory selection",
                desc: "You'll never run out of stock — and customers love variety.",
              },
              {
                title: "Support included",
                desc: "We handle technical + customer support like returns and questions.",
              },
            ].map((b) => (
              <div key={b.title} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="text-sm font-semibold">{b.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">{b.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-8 text-sm font-semibold text-background hover:opacity-95 text-decoration-none text-white"
            >
              Click - Start Your Online Business Now
            </Link>
          </div>
        </div>
      </section>

      {/* TOP REASONS */}
      <section className="container py-10 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Top reasons to choose us
          </h2>
          <p className="mt-3 text-muted-foreground">
            It's easy. It's proven. It's free. It's ready to go.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/30">
                  <img src={f.icon} alt={f.title} className="h-7 w-7 object-contain" />
                </div>
                <div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow hover:opacity-95 text-decoration-none text-white"
          >
            Click - Get Started Now
          </Link>
        </div>
      </section>

      {/* PLANS TABLE */}
      <section className="border-t bg-muted/20">
        <div className="container py-10 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Our Dropshipping Plans
            </h2>
            <p className="mt-3 text-muted-foreground">
              Choose the plan that matches how you want to sell.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left">
                    <th className="px-5 py-4 font-semibold">Plans & Benefits</th>
                    <th className="px-5 py-4 text-center font-semibold">Premium</th>
                    <th className="px-5 py-4 text-center font-semibold">No Excuse Plan</th>
                    <th className="px-5 py-4 text-center font-semibold">Premium Plus</th>
                  </tr>
                </thead>
                <tbody className="[&>tr]:border-t">
                  {[
                    ["Free Website", "yes", "yes", "yes"],
                    ["Dropshipping", "yes", "yes", "yes"],
                    ["Sell It For The Same Price We Sell For (Flat 25% Commission)", "no", "yes", "yes"],
                    ["Guest Checkout", "no", "yes", "yes"],
                    ["Sell Your Own Products", "no", "no", "yes"],
                    ["Special Discount On Items + Take An Additional", "5% OFF", "5% OFF", "10% OFF"],
                  ].map((row) => (
                    <tr key={row[0]} className="bg-background">
                      <td className="px-5 py-4 font-medium">{row[0]}</td>
                      {row.slice(1).map((cell, idx) => (
                        <td key={idx} className="px-5 py-4 text-center">
                          {cell === "yes" ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              ✓ Included
                            </span>
                          ) : cell === "no" ? (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                              ✕ Not included
                            </span>
                          ) : (
                            <span className="font-semibold">{cell}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t p-5">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <div className="text-sm text-muted-foreground">
                  Want help selecting the best plan? Register and we'll guide you.
                </div>
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-semibold text-background hover:opacity-95 text-decoration-none text-white"
                >
                  Get Started Free →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="container py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Why Choose Us?
            </h2>

            <div className="mt-4 space-y-4 text-muted-foreground">
              <p>
                We've perfected the online business model for fashion and want to give you an opportunity to make money with us for FREE.
                Our developers create your website and within a short time you can start earning.
              </p>
              <p>
                You get a custom website with a large product catalog. You're in control of your store — from pricing to branding.
              </p>
              <p className="font-semibold text-foreground">
                We handle behind-the-scenes work: maintenance, customer support, and shipping — while you enjoy the profits.
              </p>
              <p>
                We also provide updates so you always know how your business is performing.
              </p>
              <p>
                This isn't too good to be true — it's your next business. The one that actually makes money.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow hover:opacity-95 text-decoration-none text-white"
              >
                Click - Get Started Now
              </Link>
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-md border px-8 text-sm font-semibold hover:bg-muted text-decoration-none text-dark"
              >
                Create My Affiliate Website
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold">Order Your Free Website Today</div>
              <div className="mt-2 text-2xl font-bold">(908) 291-3500</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Need help? Call us and we'll guide you through registration.
              </div>

              <div className="mt-6 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                Tip: Register first — then choose plan and complete payment to activate your store.
              </div>

              <Link
                href="/register"
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-foreground px-6 text-sm font-semibold text-background hover:opacity-95 text-decoration-none text-white"
              >
                Start Free Registration →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="border-t bg-muted/20">
        <div className="container py-10">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row">
            <div>
              <div className="text-lg font-bold">Ready to launch your dropshipping store?</div>
              <div className="text-sm text-muted-foreground">
                Create your free website and start selling today.
              </div>
            </div>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow hover:opacity-95 text-decoration-none text-white"
            >
              Get Started Now →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}