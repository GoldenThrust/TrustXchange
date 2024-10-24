import PropTypes from 'prop-types';
import ReactPaginate from 'react-paginate';

export default function Pagination({ transactionsPerPage, totalTransactions, paginate, currentPage }) {
  const pageCount = Math.ceil(totalTransactions / transactionsPerPage);

  // Handle page change
  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1; 
    paginate(selectedPage);
  };

  return (
    <nav className="flex justify-center mt-4">
      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        breakLabel={"..."}
        breakClassName={"break-me"}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={"inline-flex items-center space-x-1"}
        pageClassName={"px-3 py-2 border rounded-md bg-white text-gray-600 cursor-pointer hover:bg-gray-200 hover:text-gray-900"}
        previousClassName={"px-3 py-2 border rounded-md bg-white text-gray-600 cursor-pointer hover:bg-gray-200 hover:text-gray-900"}
        nextClassName={"px-3 py-2 border rounded-md bg-white text-gray-600 cursor-pointer hover:bg-gray-200 hover:text-gray-900"}
        activeClassName={"bg-emerald-500 text-white"}
        forcePage={currentPage - 1}
      />
    </nav>
  );
}

Pagination.propTypes = {
  transactionsPerPage: PropTypes.number.isRequired,
  totalTransactions: PropTypes.number.isRequired,
  paginate: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};
