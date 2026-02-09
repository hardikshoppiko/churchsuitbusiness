import Script from "next/script";
import ReduxProvider from "@/store/ReduxProvider";

import "./globals.css";

import Header from "./header";
import Footer from "./footer";
import GlobalModal from "@/components/GlobalModal";

import { getSiteSettings } from "@/lib/settings";

import MaintenancePage from "./maintenance/page";

export default async function RootLayout({ children }) {
  // Load settings FIRST
  const settingsData = await getSiteSettings(0);

  // OpenCart-style maintenance flag
  const maintenanceEnabled = settingsData?.config?.config_maintenance === "1" || settingsData?.config?.config_maintenance === "true";

  // Redux preload
  const preloadedState = {
    settings: {
      loaded: true,
      store_id: 0,
      data: settingsData,
    },
  };

  // MAINTENANCE MODE
  if (maintenanceEnabled) {
    return (
      <html lang="en">
        <head>
          <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css" />
          <link rel="stylesheet" href="/assets/fontawesome/css/all.min.css" />
        </head>
        <body suppressHydrationWarning><MaintenancePage /></body>
      </html>
    );
  }

  // NORMAL MODE
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
        <ReduxProvider preloadedState={preloadedState}>
          <Header />
          <main className="flex-grow-1">{children}</main>
          <Footer />

          {/* ✅ Global modal mounted ONCE for the whole app */}
          <GlobalModal />
        </ReduxProvider>

        <Script src="/assets/bootstrap/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}