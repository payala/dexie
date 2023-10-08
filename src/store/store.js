import { configureStore } from "@reduxjs/toolkit";

import provider from "./reducers/provider";
import tokens from "./reducers/tokens";
import markets from "./reducers/markets";

export const store = configureStore({
  reducer: {
    provider,
    tokens,
    markets,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
