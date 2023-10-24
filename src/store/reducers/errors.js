import { createSlice } from "@reduxjs/toolkit";

export const errors = createSlice({
  name: "errors",
  initialState: {
    message: null,
  },
  reducers: {
    setError: (state, action) => {
      state.message = action.payload;
    },
    clearError: (state, action) => {
      state.message = null;
    },
  },
});

export const { setError, clearError } = errors.actions;

export default errors.reducer;
