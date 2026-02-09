"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-top bg-light mt-auto">
      <div className="container py-4">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <span className="text-muted">
              © {year} Church Suits Business. All rights reserved.
            </span>
          </div>

          <div className="col-md-6 text-center text-md-end">
            <Link href="/about" className="text-decoration-none text-dark me-3">
              About Us
            </Link>
            <Link href="/privacy" className="text-decoration-none text-dark me-3">
              Privacy
            </Link>
            <Link href="/terms" className="text-decoration-none text-dark me-3">
              Terms
            </Link>
            <Link href="/contact" className="text-decoration-none text-dark">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}