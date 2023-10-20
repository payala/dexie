import { createSlice } from "@reduxjs/toolkit";

export const dexie = createSlice({
  name: "dexie",
  initialState: {
    contract: [],
    slippage: 0.5,
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload;
    },
    setSlippage: (state, action) => {
      state.slippage = action.payload;
    },
  },
});

export const { setContract, setSlippage } = dexie.actions;

export default dexie.reducer;
