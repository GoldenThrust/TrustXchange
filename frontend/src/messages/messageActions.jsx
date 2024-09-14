import axios from "axios";
import { pfiOfferings, paymentsCurrency, selectedOfferings, paymentKinds, selectedPaymentsDetails, setActiveQuotes, selectedQuote, setRecentTransctions, setPaymentUnit } from "./messageSlice";
import toast from "react-hot-toast";

export const getPFIsOffering = (data) => async (dispatch) => {
    let res = null;
    if (data) {
        res = await axios.post('xchange/offerings', data)
    } else {
        res = await axios.get('xchange/offerings')
    }
    dispatch(pfiOfferings(res.data.offerings));
    dispatch(paymentsCurrency(res.data.paymentsCurrency))
    dispatch(setPaymentUnit(res.data.paymentUnit))
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
        dispatch(paymentKinds(null))
        toast.loading('Requesting quote...', { id: 'quote' });

        await axios.post('xchange/request-quote', data);

        dispatch(getActiveQuotes());
        toast.success('Quote received successfully', { id: 'quote' });
    } catch (error) {
        console.error(error);
        toast.error('Failed to request quote', { id: 'quote' });
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
        const res = await axios.get('xchange/transactions?page=1&limit=10');
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
        toast.success('Transaction completed successfully', { id: 'accept-quote' });
        dispatch(getActiveQuotes());
        dispatch(fetchTransactions())
    } catch (error) {
        console.error(error);
        toast.error('Failed to process transaction', { id: 'accept-quote' });
    }
}

export const closeQuotes = (data) => async (dispatch) => {
    try {
        dispatch(selectPaymentsDetails(null));
        dispatch(selectQuotes(null));
        toast.loading('Closing transaction...', { id: 'close-quote' });
        await axios.post('xchange/close-quote', data);
        toast.success('Transaction closed successfully', { id: 'close-quote' });
        dispatch(getActiveQuotes());
        dispatch(fetchTransactions())
    } catch (error) {
        console.error(error);
        toast.error('Failed to close transaction', { id: 'close-quote' });
    }
}