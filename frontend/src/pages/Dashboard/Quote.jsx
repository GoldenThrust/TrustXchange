import { useDispatch, useSelector } from "react-redux"
import { formattedDate } from "../../utils/functions.js";
import { selectQuotes } from "../../messages/messageActions.js";

export default function Quote() {
    const { activeQuotes } = useSelector((state) => state.xchange)
    const dispatch = useDispatch();

    const showQuote = (event) => {
        dispatch(selectQuotes(Object.values(activeQuotes).filter((quote) => quote.metadata.id === event.currentTarget.id)));
        event.currentTarget.style.display = 'none';
    }

    return (
        <>
            {activeQuotes && Object.keys(activeQuotes)[0] ?
                (<>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Active Quote</h2>
                    <div className="grid gap-2 grid-cols-1 lg:grid-cols-2">
                        {Object.values(activeQuotes).map((quote) => (
                            <div key={quote.metadata.id} id={quote.metadata.id} onClick={showQuote} className="quote transition-all active:bg-indigo-800 cursor-pointer hover:bg-green-700 flex h-24 bg-green-400 text-teal-50 justify-between flex-col rounded-2xl p-2 animate-pulse" >
                                <div className="flex justify-between">
                                    <div>
                                        <div className="font-semibold">{quote.pfiName}</div>
                                        {/* <div className="text-xs">{quote.metadata.id}</div> */}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">Expire at: {formattedDate(quote.data.expiresAt)}</div>
                                        <div className="text-xs">{quote.metadata.exchangeId}</div>
                                    </div>
                                </div>
                                <div>{quote.data.payin.amount}{quote.data.payin.currencyCode} {'->'} {quote.data.payout.amount}{quote.data.payout.currencyCode}</div>
                            </div>
                        ))}
                    </div>
                </>) : ''}
        </>
    )
}