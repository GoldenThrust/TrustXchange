import axios from "axios";
import { pfiOfferings, filterOfferings, paymentsCurrency, selectedOfferings, paymentKinds, selectedPaymentsDetails, setActiveQuotes, selectedQuote, setRecentTransctions } from "./messageSlice";
import toast from "react-hot-toast";

export const getPFIsOffering = () => async (dispatch) => {
    const res = await axios.get('xchange/offerings');
    dispatch(pfiOfferings(res.data));
    dispatch(pfiOfferings(res.data));
}

export const getCurrencyCode = () => async (dispatch) => {
    try {
        const res = await axios.get('xchange/currency-code');
        dispatch(paymentsCurrency(res.data));
    } catch (e) {
        console.error(e);
    }
}

export const filterOffer = (data) => async (dispatch) => {
    try {
        const res = await axios.post('xchange/filter-offerings', data);
        dispatch(filterOfferings(res.data));
    } catch (e) {
        console.error(e);
    }
}

export const selectedOffer = (data) => async (dispatch) => {
    try {
        if (data) {
            const paymentKindsObj = {
                "payIn": [],
                "payOut": [],
                "estimatedSetlementTime": null,
            }

            data.data.payin.methods.forEach((method) => {
                paymentKindsObj.payIn.push(method.kind);
            })
            data.data.payout.methods.forEach((method) => {
                paymentKindsObj.payOut.push(method.kind);
                paymentKindsObj.estimatedSetlementTime = method.estimatedSettlementTime
            })

            dispatch(paymentKinds(paymentKindsObj))
        } else {
            dispatch(paymentKinds(null))
        }

        dispatch(selectedPaymentsDetails(null))
        dispatch(selectedOfferings(data));
    } catch (e) {
        console.error(e);
    }
}


export const selectPaymentsDetails = (data) => (dispatch) => {
    dispatch(selectedPaymentsDetails(data))
}


export const requestForQuote = (data) => async (dispatch) => {
    try {
        dispatch(selectPaymentsDetails(null));
        toast.loading('Requesting for a quote...', { id: 'quote' });

        await axios.post('xchange/request-quote', data);

        dispatch(getActiveQuotes());
        toast.success('Quote received successfully', { id: 'quote' });
    } catch (error) {
        console.error(error);
        toast.error('Failed to get quote', { id: 'quote' });
    }
}


export const getActiveQuotes = () => async (dispatch) => {
    try {
        const res = await axios.get('xchange/active-quotes');
        dispatch(setActiveQuotes(res.data));
    } catch (error) {
        console.error(error);
    }
}

export const fetchTransactions = () => async (dispatch) => {
    try {
        const res = await axios.get('xchange/transactions?page=1&limit=5');
        dispatch(setRecentTransctions(res.data.transactions));
    } catch (error) {
        console.error("Error fetching transactions:", error);
    }
};

export const selectQuotes = (data) => (dispatch) => {
    dispatch(selectedQuote(data));
}

export const acceptQuotes = (data) => async (dispatch) => {
    try {
        dispatch(selectPaymentsDetails(null));
        dispatch(selectQuotes(null));
        toast.loading('Processing transaction...', { id: 'accept-quote' });
        await axios.post('xchange/accept-quote', data);
        toast.success('Transaction complete', { id: 'accept-quote' });
        dispatch(getActiveQuotes());
        dispatch(fetchTransactions())
    } catch (error) {
        console.error(error);
        toast.error('Failed to process quote', { id: 'accept-quote' });
    }
}

export const closeQuotes = (data) => async (dispatch) => {
    try {
        dispatch(selectPaymentsDetails(null));
        dispatch(selectQuotes(null));
        toast.loading('Closing transaction...', { id: 'accept-quote' });
        await axios.post('xchange/close-quote', data);
        toast.success('Transaction closed', { id: 'close-quote' });
        dispatch(getActiveQuotes());
        dispatch(fetchTransactions())
    } catch (error) {
        console.error(error);
        toast.error('Something went wrong', { id: 'close-quote' });
    }
}