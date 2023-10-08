import { createSlice } from "@reduxjs/toolkit";

export const provider = createSlice({
  name: "provider",
  initialState: {
    connection: null,
    chainId: null,
    account: null,
  },
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload;
    },
    setProvider: (state, action) => {
      state.connection = action.payload;
    },
    setChainId: (state, action) => {
      state.chainId = action.payload;
    },
  },
});

export const { setAccount, setProvider, setChainId } = provider.actions;

export default provider.reducer;
