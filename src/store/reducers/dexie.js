import { createSlice } from "@reduxjs/toolkit";

export const dexie = createSlice({
  name: "dexie",
  initialState: {
    contract: [],
    slippage: 0.5,
    bestRate: null, // Stores the best rate found for swapping
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload;
    },
    setSlippage: (state, action) => {
      state.slippage = action.payload;
    },
    setBestRate: (state, action) => {
      state.bestRateAt = action.payload;
    },
  },
});

export const { setContract, setSlippage, setBestRate } = dexie.actions;

export default dexie.reducer;
