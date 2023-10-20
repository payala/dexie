import { createSlice } from "@reduxjs/toolkit";

export const markets = createSlice({
  name: "markets",
  initialState: {
    dexContracts: {}, // Dict with contracts for all dexes
    pairs: [], // List of all available pairs
    symbols: [], // List of all available symbols
    selectedSymbol: null, // Stores the first selected symbol
    matchingSymbols: [], // Stores symbols that would have a pair with selectedSymbol
    selectedPair: null, // Stores the pair info once two symbols are selected
    selectedPairContract: null, // Stores the contract for the selected pair
    bestRateAt: null, // Stores the best rate found for swapping
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
    setBestRateAt: (state, action) => {
      console.log(`setting best rate to ${action.payload}`);
      state.bestRateAt = action.payload;
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
  setBestRateAt,
} = markets.actions;

export default markets.reducer;
