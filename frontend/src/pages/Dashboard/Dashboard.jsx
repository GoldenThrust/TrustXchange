import Headers from "./Header.jsx"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FilterOffer from "./FilterOffer.jsx";
import PaymentKindsForm from "./paymentKind.jsx";
import { formatWord } from "../../utils/functions.js";
import PaymentDetailsForm from "./PaymentDetails.jsx";
import Quote from "./Quote.jsx";
import Transactions from "./Transactions.jsx";
import Offer from "./Offer.jsx";
import QuoteDialog from "./QuoteDialog.jsx";


export default function DashBoard() {
    const { paymentsCurrency, PaymentsKinds, selectedPaymentsKind, paymentsDetails } = useSelector((state) => state.xchange);
    const [transactionCurrency, setTransactionCurrency] = useState([]);
    const [transactionKind, setTransactionKind] = useState([]);
    const [paymentDetails, selectPaymentsDetails] = useState([]);
    
    const { paymentUnit, pfis } = useSelector((state)=> state.xchange)
    const { isAuthenticated } = useSelector((state) => state.auth)
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        setTransactionCurrency([
            { register: 'payinCurrencyCode', label: 'From Currency', type: 'select', options: paymentsCurrency?.payIn || [] },
            { register: 'payoutCurrencyCode', label: 'To Currency', type: 'select', options: paymentsCurrency?.payOut || [] },
            { register: 'minUnit', label: 'Min Payout', type: 'text', placeholder: `Min: ${paymentUnit?.minPaymentUnit || 0}`},
            { register: 'maxUnit', label: 'Max Payout', type: 'text',  placeholder: `Max: ${paymentUnit?.maxPaymentUnit || 0}` },
            { register: 'pfi', label: 'PFI', type: 'select', placeholder: 'Select PFI', options: pfis || [], className: 'col-span-2' },
        ]);


        setTransactionKind([
            { register: 'payinKind', label: 'Pay-in Kind', type: 'select', options: PaymentsKinds?.payIn || [] },
            { register: 'payoutKind', label: 'Payout Kind', type: 'select', options: PaymentsKinds?.payOut || [] }
        ]);
        let payIn = [];
        let payOut = [];

        if (paymentsDetails) {
            if (paymentsDetails.payIn) {
                paymentsDetails.payIn.forEach((payin) => {
                    payIn.push({ register: `payin${payin}`, label: formatWord(payin), type: 'text', placeholder: `Enter your ${formatWord(payin)}` });
                });
            }

            if (paymentsDetails.payOut) {
                paymentsDetails.payOut.forEach((payout) => {
                    payOut.push({ register: `payout${payout}`, label: formatWord(payout), type: 'text', placeholder: `Enter recipient's ${formatWord(payout)}` });
                });
            }
        }

        selectPaymentsDetails([
            [...payIn],
            [...payOut],
            [{
                register: 'amount',
                label: 'Amount',
                type: 'number',
                placeholder: 'Input the amount to send'
            }]
        ]);



    }, [paymentsCurrency,  PaymentsKinds, paymentsDetails, paymentUnit, pfis]);


    return (
        <>
            <Headers />
            <main className="p-4 lg:px-8 grid sm:grid-cols-2 grid-cols-1 gap-5">
                <div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Transactions</h2>
                        {PaymentsKinds ? selectedPaymentsKind ? (<PaymentDetailsForm data={paymentDetails} />) : (<PaymentKindsForm data={transactionKind} />) : (<FilterOffer data={transactionCurrency} />)}
                    </div>
                    <div>
                        <Offer />
                    </div>
                </div>
                <div>
                    <Quote />
                    <Transactions />
                </div>
            </main>

            <QuoteDialog />
        </>
    );
}
