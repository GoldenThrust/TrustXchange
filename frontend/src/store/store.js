import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../auth/authSlice.js"
import xchangeReducer from "../messages/messageSlice.js"

const store = configureStore({
    reducer: {
        auth: authReducer,
        xchange: xchangeReducer
    },
});

export default  store;