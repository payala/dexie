import { createSlice } from "@reduxjs/toolkit";

export const tokens = createSlice({
  name: "markets",
  initialState: {
    dexContracts: {},
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
    setDexContracts: (state, action) => {
      state.dexContracts = action.payload;
    },
  },
});

export const { setPairs, setSymbols, setDexContracts } = tokens.actions;

export default tokens.reducer;
