import { useState } from 'react';
import { formattedDate } from '../../utils/functions.js';
import PropTypes from 'prop-types';
import ReviewPopup from '../../components/Review.jsx';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
export default function TransactionTable({ transactions }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedExchangeId, setSelectedExchangeId] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const paramValue = searchParams.get('exchangeid');

  const handleClick = (exchangeId) => () => {
    setSelectedExchangeId(exchangeId);
    setIsPopupOpen(true);
  }

  const handleReviewSubmit = async (reviewData) => {
    try {
      toast.loading("Submitting your review, please wait...", { id: 'review' });
      await axios.post('review', { ...reviewData, exchangeId: selectedExchangeId });
      toast.success("Your review has been submitted successfully!", { id: 'review' });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit your review. Please try again later.", { id: 'review' });
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };


  return (
    <>
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
            {transactions.map(({transaction, review}) => (
              <tr onClick={review ? ()=> {} : handleClick(transaction.quote.metadata.exchangeId)} key={transaction._id} title={review ? '' : 'Give Your Feedback on This Transaction'} className={`border-b last:border-none hover:bg-slate-200 ${transaction.quote.metadata.exchangeId === paramValue ? 'bg-emerald-300' : ''}`}>
                <td className="py-2 px-4  hidden sm:block">{transaction.quote.metadata.exchangeId}</td>
                <td className="py-2 px-4">{transaction.quote.pfiName}</td>
                <td className="py-2 px-4  hidden sm:block">{formattedDate(transaction.createdAt)}</td>
                <td className="py-2 px-4">
                  {parseFloat(Number(transaction.quote.data.payin.amount).toPrecision(10))}
                  {transaction.quote.data.payin.currencyCode} {'->'}
                  {parseFloat(Number(transaction.quote.data.payout.amount).toPrecision(10))}
                  {transaction.quote.data.payout.currencyCode}
                </td>
                <td className="py-2 px-4 text-sm hidden sm:block">
                  <span
                    className={`px-2 py-1 rounded-full ${transaction.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
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
      <ReviewPopup
        open={isPopupOpen}
        exchangeId={selectedExchangeId}
        handleClose={handleClosePopup}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
};

TransactionTable.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
};
