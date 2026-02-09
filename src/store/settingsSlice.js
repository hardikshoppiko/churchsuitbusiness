import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loaded: false,
  store_id: 0,
  data: {}, // OpenCart grouped settings: { code: { key: value } }
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings(state, action) {
      state.loaded = true;
      state.store_id = action.payload.store_id ?? 0;
      state.data = action.payload.data || {};
    },
    clearSettings(state) {
      state.loaded = false;
      state.store_id = 0;
      state.data = {};
    },
  },
});

export const { setSettings, clearSettings } = settingsSlice.actions;
export default settingsSlice.reducer;