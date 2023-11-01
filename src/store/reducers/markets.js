import { createSlice } from "@reduxjs/toolkit";

export const markets = createSlice({
  name: "markets",
  initialState: {
    dexContracts: {}, // Dict with contracts for all dexes
    pairs: [], // List of all available pairs
    symbols: [], // List of all available symbols
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

export const { setPairs, setSymbols, setDexContracts } = markets.actions;

export default markets.reducer;
