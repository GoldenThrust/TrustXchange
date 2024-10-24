import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { getActiveQuotes, getProcessingQuotes, updateProcessingQuotes } from "../../messages/messageActions.js"
import PropTypes from "prop-types"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { Star } from "lucide-react"
export default function ProcessingQuote({ socket }) {
    const dispatch = useDispatch()
    const { processingQuote } = useSelector((state) => state.xchange)
    const navigate = useNavigate();

    useEffect(() => {
        const notify = (id) => {
            toast((t) => (
                <div>
                    <button
                        onClick={() => {
                            navigate(`/transactions?exchangeid=${id}`)
                            toast.dismiss(t.id);
                        }}>
                        <div className="flex gap-1">
                            <Star size={20} color="springgreen" fill="springgreen" /> Review Transaction
                        </div>
                    </button>
                </div>
            ));
        };

        dispatch(getProcessingQuotes())
        socket?.on("quote_status", (exchangeId, status) => {
            console.log(`Quote status updated: ${exchangeId} - ${status}`)
            if (status === "SUCCESS") {
                setTimeout(() => {
                    dispatch(getProcessingQuotes())
                    notify(exchangeId)
                }, 1000)
                dispatch(getActiveQuotes());
            }

            dispatch(updateProcessingQuotes({ exchangeId, status }))
        })


        socket?.on("close_quote", (exchangeId) => {
            notify(exchangeId);
            dispatch(getProcessingQuotes());
            dispatch(getActiveQuotes());
        })

        socket?.on("process_quote", () => {
            console.log("Processing Open Quote");
            dispatch(getProcessingQuotes());
            dispatch(getActiveQuotes());
        })

        return () => {
            socket?.off("quote_status");
            socket?.off("close_quote");
            socket?.off("process_quote");
        };
    }, [dispatch, socket, navigate])

    return (<>
        {processingQuote && Object.keys(processingQuote)[0] ?
            (<>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Processing Quote</h2>
                <div className="grid gap-2 grid-cols-1 lg:grid-cols-2">
                    {Object.values(processingQuote).map((quote) => (
                        <div key={quote.exchangeId} id={quote.exchangeId} className="quote transition-all active:bg-indigo-800 cursor-pointer hover:bg-yellow-500 flex h-24 bg-orange-400 text-teal-50 justify-between flex-col rounded-2xl p-2 animate-pulse" >
                            <div className="flex justify-between">
                                <div>
                                    <div className="font-semibold">{quote.pfiName}</div>
                                    {/* <div className="text-xs">{quote.metadata.id}</div> */}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">Status: {quote.status}</div>
                                    <div className="text-xs">{quote.exchangeId}</div>
                                </div>
                            </div>
                            <div>{quote.payin.amount}{quote.payin.currencyCode} {'→'} {quote.payout.amount}{quote.payout.currencyCode}</div>
                        </div>
                    ))}
                </div>
            </>) : ''}
    </>
    )
}

ProcessingQuote.propTypes = {
    socket: PropTypes.object
}

// IN_PROGRESS
// TRANSFERING_FUNDS
// SUCCESS