import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formattedDate } from "../../utils/functions";
import { acceptQuotes, closeQuotes } from "../../messages/messageActions";

export default function QuoteDialog() {
    const { selectedQuote } = useSelector((state) => state.xchange);
    const [quote, setQuote] = useState(selectedQuote);
    const dispatch = useDispatch();

    useEffect(() => {
        setQuote(selectedQuote);
    }, [selectedQuote]);

    const acceptQuote = () => {
        const data = {
            'pfiDid': quote[0].metadata.from,
            'exchangeId': quote[0].metadata.exchangeId
        }

        dispatch(acceptQuotes(data));
    }

    const closeQuote = () => {
        const data = {
            'pfiDid': quote[0].metadata.from,
            'exchangeId': quote[0].metadata.exchangeId
        }

        dispatch(closeQuotes(data));
    }

    return (
        <>
            {quote?.length > 0 && quote.map((val, index) => (
                <div key={index} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center h-screen">
                    <aside className="absolute  overflow-y-auto overflow-hidden top-1/2 left-1/2 w-5/6 h-5/6 bg-gray-300" style={{ transform: 'translate(-50%, -50%)' }}>
                        <div className="p-10 flex gap-4 flex-col">
                            <div className="flex flex-col sm:flex-row justify-between place-items-center">
                                <span className="flex flex-row place-items-center gap-2">
                                    <img src="./quote.png" alt="Quote Icon" />
                                    <span className="flex flex-col">
                                        <span className="text-lg font-mono font-bold">{val.pfiName}</span>
                                        <span className="font-thin text-sm">{val.metadata?.exchangeId}</span>
                                    </span>
                                </span>
                                <span className="flex flex-col text-end">
                                    <span className="text-lg font-serif">Pay In: {val.data?.payin?.amount}{val.data?.payin?.currencyCode}</span>
                                    <span className="font-thin text-sm">Expire at: {formattedDate(val.data?.expiresAt)}</span>
                                </span>
                            </div>
                            <div className="flex flex-col gap-5">
                                {val.privateData?.payin?.paymentDetails && (
                                    <div>
                                        <h4 className="mb-2 text-xl font-bold">Your Details</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 font-serif gap-3">
                                            {Object.entries(val.privateData.payin.paymentDetails).map(([key, value]) => (
                                                <div key={key}><b>{key}:</b> {value}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {val.privateData?.payout?.paymentDetails && (
                                    <div>
                                        <h4 className="mb-2 text-xl font-bold">{"Recipient's Details"}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 font-serif gap-3">
                                            {Object.entries(val.privateData.payout.paymentDetails).map(([key, value]) => (
                                                <div key={key}><b>{key}:</b> {value}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <h4 className="mb-2 text-xl font-bold">Pay Out:</h4>
                                    <div className="font-serif">
                                        {val.data?.payout?.amount}{val.data?.payout?.currencyCode}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-md shadow-md">
                                <p className="font-semibold">A 3% transaction fee has been applied.</p>
                            </div>


                            <div className="flex gap-5 flex-col sm:flex-row">
                                <button
                                    type="button"
                                    name="Close Quote"
                                    id="close-quote"
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    onClick={closeQuote}
                                >
                                    Close Quote
                                </button>
                                <button
                                    type="button"
                                    name="Accept Quote"
                                    id="accept-quote"
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                    onClick={acceptQuote}
                                >
                                    Pay {val.data?.payin?.amount}{val.data?.payin?.currencyCode}
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            ))}
        </>
    );
}
