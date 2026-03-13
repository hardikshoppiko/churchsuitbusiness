import Link from "next/link";
import styles from "./footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME;
  const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE;
  const storeEmail = process.env.NEXT_PUBLIC_STORE_EMAIL;

  return (
    <footer className={styles.footer}>
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className={`flex items-center gap-3 ${styles.brandRow}`}>
              <div className={styles.brandIcon}>
                <span className={styles.brandIconText}>CS</span>
              </div>

              <div>
                <div className={styles.brandTitle}>{storeName}</div>
                <div className={styles.brandSubtitle}>
                  Affiliate Fashion Program
                </div>
              </div>
            </div>

            <p className={styles.brandDescription}>
              Launch your own fashion affiliate website with premium products,
              free store setup, automated fulfillment, and a business model
              designed for long-term online growth.
            </p>
          </div>

          <div className="lg:col-span-3">
            <div className={styles.sectionTitle}>Quick Links</div>
            <div className={styles.linkList}>
              <Link href="/" className={styles.footerLink}>Home</Link>
              <Link href="/register" className={styles.footerLink}>Register</Link>
              <Link href="/account/login" className={styles.footerLink}>Login</Link>
              <Link href="/contact" className={styles.footerLink}>Contact</Link>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className={styles.sectionTitle}>Legal</div>
            <div className={styles.linkList}>
              <Link href="/about-us" className={styles.footerLink}>About Us</Link>
              <Link href="/privacy" className={styles.footerLink}>Privacy</Link>
              <Link href="/terms" className={styles.footerLink}>Terms</Link>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className={styles.sectionTitle}>Need Help?</div>
            <div className={styles.contactList}>
              <div>
                <a
                  href={`tel:+1${storePhone.replace(/\D/g, "")}`}
                  className={styles.footerLink}
                >
                  {storePhone}
                </a>
              </div>
              <div>
                <a
                  href={`mailto:${storeEmail}`}
                  className={styles.footerLink}
                >
                  {storeEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div>© {year} ${storeName}. All rights reserved.</div>

          <div className={styles.bottomLinks}>
            <Link href="/about-us" className={styles.footerLink}>About Us</Link>
            <Link href="/privacy" className={styles.footerLink}>Privacy</Link>
            <Link href="/terms" className={styles.footerLink}>Terms</Link>
            <Link href="/contact" className={styles.footerLink}>Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}