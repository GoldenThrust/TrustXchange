import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    pfiOfferings: null,
    filterOfferings: null,
    paymentsCurrency: null,
    PaymentsKinds: null,
    paymentsDetails: null,
    selectedOfferings: null,
    selectedPaymentsKind: null,
    activeQuotes: null,
    selectedQuote: null,
    recentTransactions: null,
};

const xchangeSlice = createSlice({
    name: 'xchange',
    initialState,
    reducers: {
        pfiOfferings: (state, action) => {
            state.pfiOfferings = action.payload;
            state.filterOfferings = action.payload;
        },
        filterOfferings: (state, action) => {
            state.filterOfferings = action.payload;
        },
        paymentsCurrency: (state, action) => {
            state.paymentsCurrency = action.payload;
        },
        selectedOfferings: (state, action) => {
            state.selectedOfferings = action.payload;
        },
        paymentKinds: (state, action) => {
            state.PaymentsKinds = action.payload;
        },
        selectedPaymentsDetails: (state, action) => {
            state.selectedPaymentsKind = action.payload?.kind;
            state.paymentsDetails = action.payload?.details;
        },
        setActiveQuotes: (state, action) => {
            state.activeQuotes = action.payload;
        },
        selectedQuote: (state, action) => {
            state.selectedQuote = action.payload;
        },
        setRecentTransctions: (state, action) => {
            state.recentTransactions = action.payload
        }
    }
});

export const { pfiOfferings, filterOfferings, paymentsCurrency, selectedOfferings, paymentKinds, selectedPaymentsDetails, setActiveQuotes, selectedQuote, setRecentTransctions } = xchangeSlice.actions;
export default xchangeSlice.reducer;
