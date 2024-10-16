import { loginRequest, loginSuccess, loginFailure, AuthResponse, AuthError, processingData, logout, verificationFailed } from './authSlice.js';
import { getActiveQuotes, getPFIsOffering, fetchTransactions, getPFIStat } from '../messages/messageActions.js'
import axios from 'axios';
import toast from 'react-hot-toast';

export const login = (form) => async (dispatch) => {
  try {
    toast.loading("Signing you in...", { id: "login" })
    dispatch(loginRequest());
    const res = await axios.post('auth/login', form);
    const user = res.data.message;
    toast.success("Successfully signed in!", { id: "login" })
    dispatch(getActiveQuotes())
    dispatch(getPFIsOffering())
    dispatch(fetchTransactions())
    dispatch(getPFIStat())
    dispatch(loginSuccess(user));
  } catch (error) {
    toast.error("Failed to sign in. Please try again.", { id: "login" })
    dispatch(loginFailure(error.response.data.message));
  }
};


export const logoutAction = () => async (dispatch) => {
  try {
    dispatch(processingData());
    const res = await axios.get('auth/logout');
    const user = res.data.message;
    dispatch(logout(user));
  } catch (error) {
    dispatch(AuthError(error.response.data.message));
  }
};


export const verify = () => async (dispatch) => {
  try {
    dispatch(loginRequest());
    const res = await axios.get('auth/verify');
    const user = res.data.message;
    dispatch(loginSuccess(user));
  } catch (error) {
    dispatch(verificationFailed(error.response.data.message));
  }
}

export const signup = (form) => async (dispatch) => {
  try {
    toast.loading("Creating your account...", { id: "signup" })
    dispatch(processingData());
    const res = await axios.post('auth/register', form);
    const message = await res.data.message;
    toast.success("Account created successfully!", { id: "signup" })
    dispatch(AuthResponse(message));
  } catch (error) {
    toast.error("Sign up failed. Please try again.", { id: "signup" })
    dispatch(AuthError(error.response.data.message));
  }
};

export const sendAccountActivationToken = (form) => async (dispatch) => {
  try {
    toast.loading("Sending account activation link...", { id: "activation" })
    dispatch(processingData());
    const res = await axios.post('auth/resend-activate', form);
    const message = res.data.message;
    toast.success("Account activation link sent to your email!", { id: "activation" })
    dispatch(AuthResponse(message));
  } catch (error) {
    toast.error("Failed to send activation link. Please try again.", { id: "activation" })
    dispatch(AuthError(error.response.data.message));
  }
}


export const accountActivation = (token) => async (dispatch) => {
  try {
    dispatch(loginRequest());
    const res = await axios.get(`auth/activate/${token}`);
    const user = res.data.message;
    dispatch(loginSuccess(user));
  } catch (error) {
    dispatch(AuthError(error.response.data.message));
  }
}


export const forgotPassword = (form) => async (dispatch) => {
  try {
    toast.loading("Sending password reset link...", { id: "resetLink" })
    dispatch(processingData());
    const res = await axios.post('auth/forgot-password', form);
    const message = res.data.message;
    toast.success("Password reset link sent to your email!", { id: "resetLink" })
    dispatch(AuthResponse(message));
  } catch (error) {
    toast.error("Failed to send reset link. Please try again.", { id: "resetLink" })
    dispatch(AuthError(error.response.data.message));
  }
}


export const resetPassword = (token, form) => async (dispatch) => {
  try {
    toast.loading("Updating your password...", { id: "newPassword" })
    dispatch(processingData());
    const res = await axios.post(`auth/reset-password/${token}`, form);
    const message = res.data.message;
    toast.success("Password updated successfully!", { id: "newPassword" })
    dispatch(AuthResponse(message));
  } catch (error) {
    toast.error("Failed to update password. Please try again.", { id: "newPassword" })
    dispatch(AuthError(error.response.data.message));
  }
}