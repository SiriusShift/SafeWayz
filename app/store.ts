import { configureStore } from '@reduxjs/toolkit';
import { api } from "../features/api";
import userReducer from '../features/authentication/reducer/loginSlice'; // Import the user slice reducer

const store = configureStore({
  reducer: {
    // Add the RTK Query reducer
    user: userReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      api.middleware,
    ]), // Add the RTK Query middleware
});
export default store