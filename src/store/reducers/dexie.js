import { createSlice } from "@reduxjs/toolkit";

export const dexie = createSlice({
  name: "dexie",
  initialState: {
    contract: [],
    slippage: 0.5,
    selectedSymbol: null, // Stores the first selected symbol
    matchingSymbols: [], // Stores symbols that would have a pair with selectedSymbol
    selectedPair: null, // Stores the pair info once two symbols are selected
    selectedPairContract: null, // Stores the contract for the selected pair
    bestRate: null, // Stores the best rate found for swapping
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload;
    },
    setSlippage: (state, action) => {
      state.slippage = action.payload;
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
    setBestRate: (state, action) => {
      state.bestRateAt = action.payload;
    },
  },
});

export const {
  setContract,
  setSlippage,
  setSelectedSymbol,
  setMatchingSymbols,
  setSelectedPair,
  setSelectedPairContract,
  setBestRate,
} = dexie.actions;

export default dexie.reducer;
