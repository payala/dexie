import { createSlice } from "@reduxjs/toolkit";

export const dexie = createSlice({
  name: "dexie",
  initialState: {
    contract: [],
    slippage: 0.5,
    bestRate: null, // Stores the best rate found for swapping
    swapData: {
      // Contains the information necessary for the swap
      inputToken: "",
      outputToken: "",
      inputAmount: 0,
      outputAmount: 0,
      complete: false,
    },
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload;
    },
    setSlippage: (state, action) => {
      state.slippage = action.payload;
    },
    setBestRate: (state, action) => {
      state.bestRate = action.payload;
    },
    setSwapData: (state, action) => {
      state.swapData = action.payload;
    },
  },
});

export const { setContract, setSlippage, setBestRate, setSwapData } =
  dexie.actions;

export default dexie.reducer;
