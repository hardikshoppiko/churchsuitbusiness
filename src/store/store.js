import { configureStore } from "@reduxjs/toolkit";
import settingsReducer from "./settingsSlice";

export function makeStore(preloadedState) {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState,
    devTools: process.env.NODE_ENV !== "production",
  });
}