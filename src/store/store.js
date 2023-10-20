import { configureStore } from "@reduxjs/toolkit";

import provider from "./reducers/provider";
import tokens from "./reducers/tokens";
import markets from "./reducers/markets";
import dexie from "./reducers/dexie";

export const store = configureStore({
  reducer: {
    provider,
    tokens,
    markets,
    dexie,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
