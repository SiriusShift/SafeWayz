import { configureStore } from '@reduxjs/toolkit';
import { api } from "../features/api";
import userReducer from '../features/authentication/reducers/loginSlice'; // Import the user slice reducer
import reportsReducer from "../features/reports/reducers/reportsSlice"

const store = configureStore({
  reducer: {
    // Add the RTK Query reducer
    user: userReducer,
    reports: reportsReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      api.middleware,
    ]), // Add the RTK Query middleware
});
export default store