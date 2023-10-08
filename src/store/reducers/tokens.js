import { createSlice } from "@reduxjs/toolkit";

export const tokens = createSlice({
  name: "tokens",
  initialState: {
    contracts: [],
    balances: [0, 0],
  },
  reducers: {
    setContracts: (state, action) => {
      state.contracts = action.payload;
    },
    setBalances: (state, action) => {
      state.balances = action.payload;
    },
  },
});

export const { setContracts, setBalances } = tokens.actions;

export default tokens.reducer;
