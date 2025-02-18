import { configureStore } from '@reduxjs/toolkit';
import { api } from "../features/api";
const store = configureStore({
  reducer: {
    // Add the RTK Query reducer
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      api.middleware,
    ]), // Add the RTK Query middleware
});
export default store