import PropTypes from 'prop-types';

export default function Pagination({ transactionsPerPage, totalTransactions, paginate, currentPage }) {
  const pageNumbers = [];

  // Calculate total number of pages
  for (let i = 1; i <= Math.ceil(totalTransactions / transactionsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center mt-4">
      <ul className="inline-flex items-center space-x-1">
        {pageNumbers.map((number) => (
          <li key={number}>
            <a
              onClick={() => paginate(number)}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => e.key === 'Enter' && paginate(number)}
              className={`px-3 py-2 border rounded-md 
                ${number === currentPage ? 'bg-gray-300 text-gray-900' : 'bg-white text-gray-600'}
                hover:bg-gray-200 hover:text-gray-900 cursor-pointer`}
            >
              {number}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

Pagination.propTypes = {
  transactionsPerPage: PropTypes.number.isRequired,
  totalTransactions: PropTypes.number.isRequired,
  paginate: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};
