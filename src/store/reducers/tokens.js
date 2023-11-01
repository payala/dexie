import { createSlice } from "@reduxjs/toolkit";

export const tokens = createSlice({
  name: "tokens",
  initialState: {
    contracts: {},
    decimals: {},
    balances: {},
    tokenData: [],
  },
  reducers: {
    setTokenContracts: (state, action) => {
      state.contracts = action.payload;
    },
    setBalances: (state, action) => {
      state.balances = action.payload;
    },
    setDecimals: (state, action) => {
      state.decimals = action.payload;
    },
    setTokenData: (state, action) => {
      state.tokenData = action.payload;
    },
  },
});

export const { setTokenContracts, setBalances, setDecimals, setTokenData } =
  tokens.actions;

export default tokens.reducer;
