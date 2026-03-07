import Link from "next/link";

import styles from "./page.module.css";

export const metadata = {
  title: `About Us | ${process.env.STORE_NAME} Affiliate Program`,
  description: `Learn more about ${process.env.STORE_NAME}, our affiliate fashion business model, and how we help partners launch premium online stores.`,
};

function getAboutContent() {
  // Later you can replace this with DB data

  return {
    badge: "About Our Brand",
    title: "A Premium Affiliate Fashion Program Built For Growth",
    intro:
      "We help entrepreneurs launch elegant online affiliate stores focused on premium church fashion. Our goal is simple: give you the tools, support, and product access needed to build a profitable online business with confidence.",

    storyTitle: "Our Story",
    storyText1:
      "Our platform was created for people who wanted more than a basic online store. We saw the need for a business model that combines premium fashion presentation, trusted product fulfillment, and a simple way for affiliates to start earning without carrying inventory.",
    storyText2:
      "Instead of forcing store owners to handle every part of the business alone, we built a system where product sourcing, website setup, and fulfillment are handled with care — allowing our partners to focus on promotion, branding, and customer growth.",

    missionTitle: "Our Mission",
    missionText:
      "Our mission is to make it easier for affiliates and boutique-minded entrepreneurs to enter the online fashion space with a premium, professional, and scalable foundation.",

    visionTitle: "Our Vision",
    visionText:
      "We believe affiliate commerce should look polished, feel trustworthy, and provide real long-term opportunity. That is why we focus on premium design, reliable systems, and ongoing support.",

    values: [
      {
        title: "Premium Presentation",
        text: "We believe your website should reflect the elegance of the products you promote.",
      },
      {
        title: "Partner Success",
        text: "Your growth matters to us, so we build tools and support around long-term success.",
      },
      {
        title: "Reliable Fulfillment",
        text: "We help simplify operations so you can focus on traffic, customers, and conversions.",
      },
      {
        title: "Trust & Professionalism",
        text: "From branding to communication, we aim to create an experience that feels credible and refined.",
      },
    ],

    highlights: [
      "Free or simplified store setup support",
      "Premium church fashion product focus",
      "Affiliate-friendly earning model",
      "Automated fulfillment support",
      "Designed for long-term online growth",
    ],

    ctaTitle: "Build your affiliate fashion business with confidence",
    ctaText:
      "Whether you are just getting started or ready to grow your online presence, our platform is designed to help you launch with a premium foundation.",
    ctaButton: "Get Started Today",
  };
}

export default function AboutPage() {
  const content = getAboutContent();

  return (
    <div className={styles.pageBg}>
      <div className={styles.pageWrap}>
        {/* Hero */}
        <section className={styles.heroCard}>
          <div className={styles.heroGlowWrap}>
            <div className={styles.heroGlowLeft} />
            <div className={styles.heroGlowRight} />
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>{content.badge}</div>

            <h1 className={styles.heroTitle}>{content.title}</h1>

            <p className={styles.heroText}>{content.intro}</p>
          </div>
        </section>

        {/* Story + Sidebar */}
        <section className={styles.contentGrid}>
          <div className={styles.mainCard}>
            <div className={styles.sectionBlock}>
              <div className={styles.sectionEyebrow}>Who We Are</div>
              <h2 className={styles.sectionTitle}>{content.storyTitle}</h2>
              <p className={styles.sectionText}>{content.storyText1}</p>
              <p className={styles.sectionText}>{content.storyText2}</p>
            </div>

            <div className={styles.separator} />

            <div className={styles.twoColGrid}>
              <div className={styles.infoCard}>
                <div className={styles.infoCardLabel}>Our Mission</div>
                <div className={styles.infoCardTitle}>{content.missionTitle}</div>
                <p className={styles.infoCardText}>{content.missionText}</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoCardLabel}>Our Vision</div>
                <div className={styles.infoCardTitle}>{content.visionTitle}</div>
                <p className={styles.infoCardText}>{content.visionText}</p>
              </div>
            </div>
          </div>

          <aside className={styles.sideCard}>
            <div className={styles.sideTitle}>Why Choose Us</div>
            <ul className={styles.highlightList}>
              {content.highlights.map((item) => (
                <li key={item} className={styles.highlightItem}>
                  <span className={styles.highlightDot} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        {/* Values */}
        <section className={styles.valuesSection}>
          <div className={styles.sectionHeaderCenter}>
            <div className={styles.sectionEyebrow}>Our Values</div>
            <h2 className={styles.sectionTitleCenter}>
              The principles behind our platform
            </h2>
            <p className={styles.sectionTextCenter}>
              We focus on building a fashion affiliate experience that feels polished,
              practical, and built for real business growth.
            </p>
          </div>

          <div className={styles.valuesGrid}>
            {content.values.map((item) => (
              <div key={item.title} className={styles.valueCard}>
                <div className={styles.valueCardTitle}>{item.title}</div>
                <p className={styles.valueCardText}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <div>
              <div className={styles.ctaTitle}>{content.ctaTitle}</div>
              <p className={styles.ctaText}>{content.ctaText}</p>
            </div>

            <Link href="/register" className={styles.ctaBtn}>
              {content.ctaButton}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}