import { createSlice } from "@reduxjs/toolkit";

export const dexie = createSlice({
  name: "dexie",
  initialState: {
    contract: [],
    slippage: 0.5,
    inputSymbol: null, // Stores the selected input symbol
    outputSymbol: null, // Stores the selected output symbol
    outputMatchingSymbols: [], // Stores symbols that would have a pair with inputSymbol
    inputMatchingSymbols: [], // Stores symbols that would have a pair with outputSymbol
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
    setInputSymbol: (state, action) => {
      state.inputSymbol = action.payload;
    },
    setOutputMatchingSymbols: (state, action) => {
      state.outputMatchingSymbols = action.payload;
    },
    setInputMatchingSymbols: (state, action) => {
      state.inputMatchingSymbols = action.payload;
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
  setInputSymbol,
  setOutputMatchingSymbols,
  setInputMatchingSymbols,
  setSelectedPair,
  setSelectedPairContract,
  setBestRate,
} = dexie.actions;

export default dexie.reducer;
