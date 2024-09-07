import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  response: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.loginerror = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    verificationFailed: (state, action) => {
      state.verificationError = action.payload;
    },
    processingData: (state) => {
      state.loading = true;
    },
    AuthError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.response = null;
    },
    AuthResponse: (state, action) => {
      state.loading = false;
      state.response = action.payload;
      state.error = null;
    }
  }
});

export const { loginRequest, loginSuccess, loginFailure, logout, verificationFailed, processingData, AuthError, AuthResponse } = authSlice.actions;

export default authSlice.reducer;
