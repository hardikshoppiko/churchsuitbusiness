"use client";

import ReduxProvider from "@/store/ReduxProvider";
import { ToastProvider } from "@/components/ui/use-toast";

export default function ClientProviders({ preloadedState, children }) {
  return (
    <ToastProvider>
      <ReduxProvider preloadedState={preloadedState}>
        {children}
      </ReduxProvider>
    </ToastProvider>
  );
}