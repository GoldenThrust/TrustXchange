import { useEffect, useMemo, useState } from "react";
import { formattedDate } from "../../utils/functions.js";
import { useSelector } from "react-redux";
import { CheckCircle } from "lucide-react";

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);


    const { recentTransactions } = useSelector((state) => state.xchange);

    useEffect(() => {
        setTransactions(recentTransactions);
    }, [recentTransactions]);

    const memoisedTransaction = useMemo(() => {
        return transactions || [];
    }, [transactions]);

    return (
        <>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
            <div className="grid gap-2 grid-cols-1 xl:grid-cols-2">
                {memoisedTransaction.map(({transaction}) => (
                    <div key={transaction.quote.metadata.exchangeId} className="quote flex h-24 bg-blue-400 text-teal-50 justify-between flex-col rounded-2xl p-2">
                        <div className="flex justify-between">
                            <div>
                                <div className="font-semibold flex gap-1"><CheckCircle /> {transaction.quote.pfiName}</div>
                                <div className="text-xs">{transaction.quote.metadata.exchangeId}</div>
                            </div>
                            <div>
                                <div className="text-sm font-semibold">Created at: {formattedDate(transaction.createdAt)}</div>
                            </div>
                        </div>
                        <div className="flex justify-between font-mono">
                            <span>{parseFloat(Number(transaction.quote.data.payin.amount).toPrecision(10))}{transaction.quote.data.payin.currencyCode} {'→'} {parseFloat(Number(transaction.quote.data.payout.amount).toPrecision(10))}{transaction.quote.data.payout.currencyCode}</span>
                            <span>Status: {transaction.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
