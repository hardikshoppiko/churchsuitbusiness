"use client";

import { Provider } from "react-redux";
import { useRef } from "react";
import { makeStore } from "./store";

export default function ReduxProvider({ children, preloadedState }) {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    storeRef.current = makeStore(preloadedState);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}