import styles from "./page.module.css";

export const metadata = {
  title: `Terms & Conditions | ${process.env.STORE_NAME} Affiliate Program`,
  description: `Review the terms and conditions for ${process.env.STORE_NAME} and understand the rules, responsibilities, and conditions for using our platform.`,
};

function getTermsContent() {
  // Later replace with DB content
  return {
    badge: "Terms & Conditions",
    title: "The terms that govern use of our platform",
    intro:
      "These Terms & Conditions explain the rules, responsibilities, and conditions that apply when using our affiliate program, website, and related services. By accessing or using our platform, you agree to these terms.",

    updatedLabel: "Last Updated",
    updatedValue: "March 7, 2026",

    sections: [
      {
        title: "Acceptance of Terms",
        text: [
          "By accessing this website, registering for an account, or using any part of our affiliate platform, you agree to comply with these Terms & Conditions and all applicable laws and regulations.",
          "If you do not agree with any part of these terms, you should discontinue use of the website and related services.",
        ],
      },
      {
        title: "Use of the Platform",
        text: [
          "Our platform is provided to support affiliates, partners, and users who wish to operate or promote online fashion-related business opportunities through our services.",
          "You agree to use the platform in a lawful, professional, and responsible manner and not to interfere with the proper operation, security, or functionality of the website.",
        ],
      },
      {
        title: "Account Responsibility",
        text: [
          "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
          "You agree to provide accurate information during registration and to keep your account information current, complete, and truthful.",
        ],
      },
      {
        title: "Payments and Billing",
        text: [
          "Certain features, subscriptions, services, or account-related operations may involve billing or recurring charges depending on the plan or service selected.",
          "You agree to provide valid billing information and understand that fees, payment schedules, and service access may be subject to the terms of your selected plan.",
        ],
      },
      {
        title: "Affiliate and Business Use",
        text: [
          "Our services may be used for business or affiliate purposes, including the operation and promotion of online stores, websites, and related marketing activities.",
          "You are responsible for the way you market, promote, and present your business, and you agree not to use false, misleading, unlawful, or harmful claims in connection with the platform.",
        ],
      },
      {
        title: "Intellectual Property",
        text: [
          "All website content, branding, graphics, text, technology, and platform materials are owned by us or our licensors unless otherwise stated.",
          "You may not copy, reproduce, modify, distribute, or misuse any part of the platform or its materials without prior written permission, except where explicitly allowed.",
        ],
      },
      {
        title: "Limitations of Liability",
        text: [
          "We aim to provide a reliable and professional platform, but we do not guarantee uninterrupted access, error-free operation, or outcomes relating to business performance, sales, or earnings.",
          "To the fullest extent allowed by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the platform or reliance on its content or services.",
        ],
      },
      {
        title: "Termination and Suspension",
        text: [
          "We reserve the right to suspend, restrict, or terminate access to the platform if we believe there has been a violation of these terms, misuse of the services, unlawful conduct, or behavior that may harm the platform or other users.",
          "Termination of access does not remove any obligations that arose prior to termination, including payment obligations or compliance responsibilities.",
        ],
      },
      {
        title: "Changes to Terms",
        text: [
          "We may revise these Terms & Conditions from time to time to reflect operational, legal, or business changes. Updated terms will be posted on this page with a revised effective date.",
          "Continued use of the platform after any updates means you accept the revised terms.",
        ],
      },
    ],

    highlights: [
      "Use the platform responsibly and lawfully",
      "Keep account and billing information accurate",
      "Do not misuse content or branding",
      "We may update terms when services or policies change",
    ],

    contactTitle: "Need clarification on these terms?",
    contactText:
      "If you have questions about these Terms & Conditions or want clarification regarding account, billing, or service use, please contact our support team.",
    contactButton: "Contact Support",
  };
}

export default function TermsPage() {
  const content = getTermsContent();

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

            <div className={styles.updatedRow}>
              <span className={styles.updatedLabel}>{content.updatedLabel}</span>
              <span className={styles.updatedValue}>{content.updatedValue}</span>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className={styles.contentGrid}>
          <div className={styles.mainCard}>
            {content.sections.map((section, index) => (
              <div key={section.title}>
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionTitle}>{section.title}</div>

                  {section.text.map((paragraph, pIndex) => (
                    <p key={pIndex} className={styles.sectionText}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {index !== content.sections.length - 1 ? (
                  <div className={styles.separator} />
                ) : null}
              </div>
            ))}
          </div>

          <aside className={styles.sideCard}>
            <div className={styles.sideTitle}>Terms Highlights</div>

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

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <div>
              <div className={styles.ctaTitle}>{content.contactTitle}</div>
              <p className={styles.ctaText}>{content.contactText}</p>
            </div>

            <a href="/contact" className={styles.ctaBtn}>
              {content.contactButton}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}