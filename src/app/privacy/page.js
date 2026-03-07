import Link from "next/link";

import styles from "./page.module.css";

export const metadata = {
  title: `Privacy Policy | ${process.env.STORE_NAME} Affiliate Program`,
  description: `Read the privacy policy for ${process.env.STORE_NAME} and learn how we collect, use, and protect your information.`,
};

function getPrivacyContent() {
  // Later replace with DB content
  return {
    badge: "Privacy Policy",
    title: "Your privacy matters to us",
    intro:
      "We are committed to protecting your personal information and handling your data with care, transparency, and professionalism. This page explains what information we collect, how we use it, and the steps we take to keep it secure.",

    updatedLabel: "Last Updated",
    updatedValue: "March 7, 2026",

    sections: [
      {
        title: "Information We Collect",
        text: [
          "We may collect personal information such as your name, email address, phone number, billing details, and account-related information when you register, contact us, or use our services.",
          "We may also collect technical information such as browser type, device details, IP address, and pages visited in order to improve site performance, user experience, and security.",
        ],
      },
      {
        title: "How We Use Information",
        text: [
          "We use collected information to provide support, manage affiliate accounts, process billing, improve website functionality, and communicate important updates related to your account or our services.",
          "Your information may also be used for internal analytics, fraud prevention, customer service, and improving the quality of our platform.",
        ],
      },
      {
        title: "How We Protect Your Data",
        text: [
          "We take reasonable administrative, technical, and operational measures to help protect your personal information from unauthorized access, misuse, disclosure, or alteration.",
          "While no online system can guarantee absolute security, we continuously work to maintain a safe and professional environment for our users and partners.",
        ],
      },
      {
        title: "Sharing of Information",
        text: [
          "We do not sell your personal information to third parties. Information may only be shared when necessary to provide services, process payments, operate the platform, comply with legal obligations, or protect the integrity of our business.",
          "In some cases, service providers may help us operate parts of the website or support systems, but only for legitimate business purposes.",
        ],
      },
      {
        title: "Cookies and Tracking",
        text: [
          "We may use cookies and similar technologies to improve site functionality, remember preferences, measure performance, and enhance the overall user experience.",
          "You may choose to disable cookies in your browser settings, although some website features may not function properly if cookies are turned off.",
        ],
      },
      {
        title: "Your Choices and Rights",
        text: [
          "You may contact us at any time to request updates to your personal information, ask questions about how your data is used, or request account-related support.",
          "Depending on your jurisdiction, you may also have additional rights relating to access, correction, deletion, or limitation of your personal information.",
        ],
      },
      {
        title: "Policy Updates",
        text: [
          "We may update this Privacy Policy from time to time to reflect operational, legal, or service-related changes. Any updates will be posted on this page with a revised effective date.",
          "We encourage users to review this page periodically to stay informed about how their information is handled.",
        ],
      },
    ],

    highlights: [
      "We do not sell your personal information",
      "We use reasonable safeguards to protect your data",
      "We only collect information needed to support services and operations",
      "You may contact us for privacy-related questions",
    ],

    contactTitle: "Questions about privacy?",
    contactText:
      "If you have questions about this Privacy Policy or how your information is handled, please contact our support team and we will be happy to assist you.",
    contactButton: "Contact Support",
  };
}

export default function PrivacyPage() {
  const content = getPrivacyContent();

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
            <div className={styles.sideTitle}>Privacy Highlights</div>

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

            <Link href="/contact" className={styles.ctaBtn}>
              {content.contactButton}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}