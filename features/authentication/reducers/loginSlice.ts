import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null, // Initial state for user info (can be null or an empty object)
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload; // Set the user info in the state
    },
    clearUserInfo: (state) => {
      state.userInfo = null; // Clear the user info from the state
    },
  },
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;

export default userSlice.reducer;