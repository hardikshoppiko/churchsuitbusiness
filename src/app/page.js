import Link from "next/link";
import styles from "./home.module.css";

export const metadata = {
  title: "Affiliate Website Program, Start Selling Church Suits Online",
  description:
    "Build your own affiliate fashion website, sell church suits and dresses online, and start earning with a premium dropshipping business model.",
};

const FEATURES = [
  {
    title: "Free Store Setup",
    desc: "We build your affiliate website for you with a polished, boutique-style design.",
    icon: "/assets/images/icons/icon01.png",
  },
  {
    title: "Premium Product Access",
    desc: "Sell church suits, dresses, hats, and menswear without carrying inventory.",
    icon: "/assets/images/icons/icon02.png",
  },
  {
    title: "Automated Fulfillment",
    desc: "We manage order processing, packing, shipping, and customer support.",
    icon: "/assets/images/icons/icon03.png",
  },
  {
    title: "No Experience Needed",
    desc: "Our system is simple enough for beginners and powerful enough to grow with you.",
    icon: "/assets/images/icons/icon04.png",
  },
  {
    title: "Elegant Store Presentation",
    desc: "Launch with a website that feels premium, modern, and ready to convert.",
    icon: "/assets/images/icons/icon05.png",
  },
  {
    title: "Built For Real Profit",
    desc: "Focus on promoting your business while we handle the operations behind the scenes.",
    icon: "/assets/images/icons/icon06.png",
  },
];

const STEPS = [
  {
    no: "01",
    title: "Register your account",
    desc: "Complete a quick signup so we can begin preparing your affiliate website.",
  },
  {
    no: "02",
    title: "We build your store",
    desc: "Your site is designed, stocked with products, and prepared for customers.",
  },
  {
    no: "03",
    title: "Promote and earn",
    desc: "Share your store, attract buyers, and earn while we handle fulfillment.",
  },
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.heroSection}>
  <div className={styles.heroBgGlow} />

  <div className={`container ${styles.heroContainer}`}>
    <div className={styles.heroGrid}>
      {/* LEFT */}
      <div className={styles.heroLeft}>
        <div className={styles.eyebrowBadge}>
          Free Website • Fashion Affiliate Program • Dropshipping
        </div>

        <h1 className={styles.heroTitle}>
          Build A Premium Church Fashion Business Without Inventory
        </h1>

        <p className={styles.heroText}>
          Launch your own affiliate fashion website with elegant products,
          a polished online store, and automated fulfillment designed to
          help you start selling faster.
        </p>

        <div className={styles.heroButtonRow}>
          <Link href="/register" className={`${styles.primaryBtn} text-decoration-none`}>
            Start Free Registration
          </Link>

          <Link href="/register" className={`${styles.secondaryBtn} text-decoration-none`}>
            Create My Affiliate Store
          </Link>
        </div>

        <div className={styles.heroMeta}>
          <span>No inventory cost</span>
          <span className="hidden sm:inline">•</span>
          <span>Free website setup</span>
          <span className="hidden sm:inline">•</span>
          <span>Cancel anytime</span>
        </div>

        <div className={styles.heroMiniGrid}>
          {[
            {
              title: "Fast Setup",
              desc: "Your store is built for you.",
            },
            {
              title: "Premium Fashion",
              desc: "Sell elegant, in-demand styles.",
            },
            {
              title: "We Fulfill Orders",
              desc: "You focus on promotion.",
            },
          ].map((item) => (
            <div key={item.title} className={styles.miniCard}>
              <div className={styles.miniCardTitle}>{item.title}</div>
              <div className={styles.miniCardDesc}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className={styles.heroRight}>
        <div className={styles.heroImageGrid}>
          <div className={styles.imageCardLarge}>
            <img
              src="/assets/images/home/lifestyle-woman.jpg"
              alt="Fashion model collage"
              className={styles.imageLarge}
            />
          </div>

          <div className={styles.imageCardSmall}>
            <img
              src="/assets/images/home/boutique-lifestyle-new.jpg"
              alt="Elegant woman in church fashion"
              className={styles.imageSmall}
            />
          </div>

          <div className={styles.imageCardSmall}>
            <img
              src="/assets/images/home/product-collage.jpg"
              alt="Fashion product collage"
              className={styles.imageSmall}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* PAYMENT + SHIPPING STRIP */}
      <section className={styles.trustSection}>
        <div className="container py-8">
          <p className={styles.trustText}>
            Secure payments and trusted shipping support
          </p>

          <div className={styles.trustLogos}>
            <img src="/assets/images/brands/stripe.png" alt="Stripe" className={styles.brandLogo} />
            <img src="/assets/images/brands/paypal.png" alt="PayPal" className={styles.brandLogo} />
            <img src="/assets/images/brands/ups.png" alt="UPS" className={styles.brandLogo} />
            <img src="/assets/images/brands/fedex.png" alt="FedEx" className={styles.brandLogo} />
            <img src="/assets/images/brands/usps.png" alt="USPS" className={styles.brandLogo} />
          </div>
        </div>
      </section>

      {/* LIFESTYLE SECTION */}
      <section className="container py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className={styles.sectionEyebrow}>A Fashion-First Opportunity</div>
            <h2 className={styles.sectionTitle}>
              Start a boutique-style online business with an elegant presentation
            </h2>
            <p className={styles.sectionText}>
              This affiliate program is built for people who want more than a basic website.
              It gives you a polished store, premium fashion products, and a system designed
              to help you sell with confidence.
            </p>
            <p className={styles.sectionText}>
              You do not need inventory, storage, or a technical team. We handle the behind-the-scenes work so you can focus on growing your brand.
            </p>

            <div className="mt-8">
              <Link href="/register" className={`${styles.primaryBtn} text-decoration-none`}>
                Start Your Business Today
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 md:grid-cols-2">
              <div className={styles.imagePanelTall}>
                <img
                  src="/assets/images/home/hero-model.jpg"
                  alt="Elegant church fashion woman"
                  className={styles.fullImage}
                />
              </div>

              <div className="grid gap-5">
                <div className={styles.imagePanelShort}>
                  <img
                    src="/assets/images/home/boutique-lifestyle.jpg"
                    alt="Boutique lifestyle"
                    className={styles.fullImage}
                  />
                </div>

                <div className={styles.imagePanelShort}>
                  <img
                    src="/assets/images/home/product-collage.jpg"
                    alt="Product collage"
                    className={styles.fullImage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.softSection}>
        <div className="container py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className={styles.sectionEyebrow}>Simple Process</div>
            <h2 className={styles.sectionTitleCentered}>
              Three easy steps to your own affiliate fashion store
            </h2>
            <p className={styles.sectionTextCentered}>
              A clean path from registration to promotion, without the usual startup complications.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.no} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.no}</div>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDesc}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="container py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className={styles.sectionEyebrow}>Watch How It Works</div>
            <h2 className={styles.sectionTitle}>
              See how your affiliate fashion website comes together
            </h2>
            <p className={styles.sectionText}>
              From store setup to order fulfillment, our system is built to make online selling easier and more elegant.
            </p>

            <div className="mt-7">
              <Link href="/register" className={`${styles.primaryBtn} text-decoration-none`}>
                Start Your Store Now
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className={styles.videoCard}>
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

      {/* FEATURES */}
      <section className={styles.softSectionAlt}>
        <div className="container py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className={styles.sectionEyebrow}>Top Benefits</div>
            <h2 className={styles.sectionTitleCentered}>
              Everything you need to run a premium affiliate store
            </h2>
            <p className={styles.sectionTextCentered}>
              The tools, support, and systems that make this model simple and scalable.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className="flex items-start gap-4">
                  <div className={styles.featureIconWrap}>
                    <img src={f.icon} alt={f.title} className="h-7 w-7 object-contain" />
                  </div>
                  <div>
                    <div className={styles.featureTitle}>{f.title}</div>
                    <div className={styles.featureDesc}>{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="container py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className={styles.sectionEyebrow}>Pricing Plans</div>
          <h2 className={styles.sectionTitleCentered}>
            Our Dropshipping Plans
          </h2>
          <p className={styles.sectionTextCentered}>
            Choose the plan that matches your goals and how you want to grow.
          </p>
        </div>

        <div className={styles.planTableWrap}>
          <div className="overflow-x-auto">
            <table className={styles.planTable}>
              <thead className={styles.planTableHead}>
                <tr className="text-left">
                  <th className="px-5 py-4 font-semibold">Plans & Benefits</th>
                  <th className="px-5 py-4 text-center font-semibold">Premium</th>
                  <th className="px-5 py-4 text-center font-semibold">No Excuse Plan</th>
                  <th className="px-5 py-4 text-center font-semibold">Premium Plus</th>
                </tr>
              </thead>
              <tbody className={styles.planTableBody}>
                {[
                  ["Free Website", "yes", "yes", "yes"],
                  ["Dropshipping", "yes", "yes", "yes"],
                  ["Sell It For The Same Price We Sell For (Flat 25% Commission)", "no", "yes", "yes"],
                  ["Guest Checkout", "no", "yes", "yes"],
                  ["Sell Your Own Products", "no", "no", "yes"],
                  ["Special Discount On Items + Take An Additional", "5% OFF", "5% OFF", "10% OFF"],
                ].map((row) => (
                  <tr key={row[0]}>
                    <td className="px-5 py-4 font-medium">{row[0]}</td>
                    {row.slice(1).map((cell, idx) => (
                      <td key={idx} className="px-5 py-4 text-center">
                        {cell === "yes" ? (
                          <span className={styles.badgeSuccess}>✓ Included</span>
                        ) : cell === "no" ? (
                          <span className={styles.badgeDanger}>✕ Not included</span>
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

          <div className={styles.planFooter}>
            <div className={styles.planFooterText}>
              Need help selecting the right plan? Register and we'll guide you.
            </div>
            <Link href="/register" className={`${styles.darkBtn} text-decoration-none`}>
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalSection}>
        <div className="container py-10">
          <div className={styles.finalCard}>
            <div>
              <div className={styles.finalTitle}>Ready to launch your affiliate fashion store?</div>
              <div className={styles.finalText}>
                Create your free website and start building your business today.
              </div>
            </div>

            <Link href="/register" className={`${styles.primaryBtn} text-decoration-none`}>
              Get Started Now →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}