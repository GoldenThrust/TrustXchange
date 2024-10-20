import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    pfiOfferings: null,
    paymentUnit: null,
    paymentsCurrency: null,
    PaymentsKinds: null,
    paymentsDetails: null,
    selectedOfferings: null,
    selectedPaymentsKind: null,
    activeQuotes: null,
    selectedQuote: null,
    recentTransactions: null,
    processingQuote: null,
    filtering: false,
    pfis: [],
    pfisStat: [],
};

const xchangeSlice = createSlice({
    name: 'xchange',
    initialState,
    reducers: {
        pfiOfferings: (state, action) => {
            state.pfiOfferings = action.payload;
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
        },
        setPaymentUnit: (state, action) => {
            state.paymentUnit = action.payload;
        },
        filtering: (state, action) => {
            state.filtering = action.payload
        },
        setPfis: (state, action) => {
            state.pfis = action.payload
        },
        setPfisStat: (state, action) => {
            state.pfisStat = action.payload
        },
        setProcessingQuotes: (state, action) => {
            state.processingQuote = action.payload;
        },
        updateQuoteStatus(state, action) {
            const updatedQuote = action.payload;
            const exchangeId = updatedQuote.exchangeId;

            // Check if the exchangeId exists in the processingQuote object
            if (state.processingQuote[exchangeId]) {
                // Update the status of the quote with the given exchangeId
                state.processingQuote[exchangeId] = {
                    ...state.processingQuote[exchangeId],
                    status: updatedQuote.status,
                };
            } else {
                console.error(`Quote with exchangeId ${exchangeId} not found.`);
            }
        },
    }
});

export const { pfiOfferings, paymentsCurrency, selectedOfferings, paymentKinds, selectedPaymentsDetails, setActiveQuotes, selectedQuote, setRecentTransctions, setPaymentUnit, filtering, setPfis, setPfisStat, setProcessingQuotes, updateQuoteStatus } = xchangeSlice.actions;
export default xchangeSlice.reducer;
