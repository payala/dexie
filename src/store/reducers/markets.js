import { createSlice } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";

export const tokens = createSlice({
  name: "markets",
  initialState: {
    dexContracts: {},
    pairs: [],
    symbols: [],
    selectedSymbol: null,
    matchingSymbols: [],
    selectedPair: null,
    selectedPairContract: null,
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
} = tokens.actions;

export default tokens.reducer;
