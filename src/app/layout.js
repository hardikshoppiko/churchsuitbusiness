import Script from "next/script";

import "./globals.css";

import Header from "./header";
import Footer from "./footer";
import GlobalModal from "@/components/GlobalModal";
import NewsletterPopup from "@/components/NewsletterPopup";

import { getSiteSettings, pickPublicSettings } from "@/lib/settings";
import MaintenancePage from "./maintenance/page";

import ClientProviders from "@/components/ClientProviders";

export default async function RootLayout({ children }) {
  const settingsData = await getSiteSettings(0);

  const maintenanceEnabled =
    settingsData?.config?.config_maintenance === "1" ||
    settingsData?.config?.config_maintenance === "true";

  const publicSettings = pickPublicSettings(settingsData);

  const preloadedState = {
    settings: {
      loaded: true,
      store_id: 0,
      data: publicSettings,
    },
  };

  if (maintenanceEnabled) {
    return (
      <html lang="en">
        <head>
          <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css" />
          <link rel="stylesheet" href="/assets/fontawesome/css/all.min.css" />
        </head>

        <body suppressHydrationWarning>
          <ClientProviders preloadedState={preloadedState}>
            <MaintenancePage />
          </ClientProviders>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" rel="stylesheet" />

        <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/fontawesome/css/all.min.css" />
        <link rel="stylesheet" href="/assets/stylesheet/stylesheet.css" />
        <link rel="stylesheet" href="/assets/stylesheet/stylesheet_responsive.css" />
      </head>

      <body className="d-flex flex-column min-vh-100" suppressHydrationWarning>
        <ClientProviders preloadedState={preloadedState}>
          <Header />
          <main className="flex-grow-1">{children}</main>
          <Footer />
          <GlobalModal />
          <NewsletterPopup />
        </ClientProviders>

        <Script src="/assets/bootstrap/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}