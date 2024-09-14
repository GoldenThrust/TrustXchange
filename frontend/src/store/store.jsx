import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../auth/authSlice.jsx"
import xchangeReducer from "../messages/messageSlice.jsx"

const store = configureStore({
    reducer: {
        auth: authReducer,
        xchange: xchangeReducer
    },
});

export default  store;