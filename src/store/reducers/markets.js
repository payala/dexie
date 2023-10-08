import { createSlice } from "@reduxjs/toolkit";

export const tokens = createSlice({
  name: "markets",
  initialState: {
    pairs: [],
    symbols: [],
  },
  reducers: {
    setPairs: (state, action) => {
      state.pairs = action.payload;
    },
    setSymbols: (state, action) => {
      state.symbols = action.payload;
    },
  },
});

export const { setPairs, setSymbols } = tokens.actions;

export default tokens.reducer;
