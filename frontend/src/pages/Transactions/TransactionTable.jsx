import { formattedDate } from '../../utils/functions';
import PropTypes from 'prop-types';

export default function TransactionTable({ transactions }) {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-indigo-900 p-6 rounded-lg shadow-2xl">
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-cyan-900 text-white text-left">
          <tr>
            <th className="py-2 px-4 font-semibold hidden sm:block">Exchange ID</th>
            <th className="py-2 px-4 font-semibold">PFI Name</th>
            <th className="py-2 px-4 font-semibold  hidden sm:block">Created Date</th>
            <th className="py-2 px-4 font-semibold">Amount</th>
            <th className="py-2 px-4 font-semibold hidden sm:block">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {transactions.map((transaction) => (
            <tr key={transaction._id} className="border-b last:border-none">
              <td className="py-2 px-4  hidden sm:block">{transaction.quote.metadata.exchangeId}</td>
              <td className="py-2 px-4">{transaction.quote.pfiName}</td>
              <td className="py-2 px-4  hidden sm:block">{formattedDate(transaction.createdAt)}</td>
              <td className="py-2 px-4">
                {transaction.quote.data.payin.amount}
                {transaction.quote.data.payin.currencyCode} {'->'} 
                {transaction.quote.data.payout.amount}
                {transaction.quote.data.payout.currencyCode}
              </td>
              <td className="py-2 px-4 text-sm hidden sm:block">
                <span 
                  className={`px-2 py-1 rounded-full ${
                    transaction.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                    transaction.status === 'CLOSED' ? 'bg-yellow-100 text-yellow-800' : 
                    transaction.status === 'IN_PROGRESS' ? 'bg-yellow-400 text-yellow-900' : 
                    transaction.status === 'TRANSFERING_FUNDS' ? 'bg-green-400 text-green-900' : 
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {transaction.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TransactionTable.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
};
