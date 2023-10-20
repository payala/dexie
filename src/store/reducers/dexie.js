import { createSlice } from "@reduxjs/toolkit";

export const dexie = createSlice({
  name: "dexie",
  initialState: {
    contract: [],
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload;
    },
  },
});

export const { setContract } = dexie.actions;

export default dexie.reducer;
