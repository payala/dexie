import { createSlice } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";

export const tokens = createSlice({
  name: "markets",
  initialState: {
    dexContracts: {}, // Dict with contracts for all dexes
    pairs: [], // List of all available pairs
    symbols: [], // List of all available symbols
    selectedSymbol: null, // Stores the first selected symbol
    matchingSymbols: [], // Stores symbols that would have a pair with selectedSymbol
    selectedPair: null, // Stores the pair info once two symbols are selected
    selectedPairContract: null, // Stores the contract for the selected pair
    reversed: false, // false if token0 = input && token1 = output
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
    setSelectedSymbol: (state, action) => {
      state.selectedSymbol = action.payload;
    },
    setMatchingSymbols: (state, action) => {
      state.matchingSymbols = action.payload;
    },
    setSelectedPair: (state, action) => {
      state.selectedPair = action.payload;
    },
    setSelectedPairContract: (state, action) => {
      state.selectedPairContract = action.payload;
    },
    setReversed: (state, action) => {
      state.reversed = action.payload;
    },
  },
});

export const {
  setPairs,
  setSymbols,
  setDexContracts,
  setSelectedSymbol,
  setMatchingSymbols,
  setSelectedPair,
  setSelectedPairContract,
  setReversed,
} = tokens.actions;

export default tokens.reducer;
