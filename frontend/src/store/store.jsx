import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../auth/authSlice"
import xchangeReducer from "../messages/messageSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        xchange: xchangeReducer
    },
});

export default  store;