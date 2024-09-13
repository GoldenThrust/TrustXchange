import { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import TransactionTable from './TransactionTable';
import { Header } from '../Authentication/header';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);  // Holds transaction data
    const [currentPage, setCurrentPage] = useState(1);      // Holds the current page
    const [transactionsPerPage] = useState(10);              // Number of transactions per page
    const [totalTransactions, setTotalTransactions] = useState(0);  // Total number of transactions

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get(`/xchange/transactions?page=${currentPage}&limit=${transactionsPerPage}`);

                const { transactions, totalTransactions } = response.data;

                setTransactions(transactions || []);
                setTotalTransactions(totalTransactions || 0);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, [currentPage, transactionsPerPage]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <>
            <Header />
            <div className="p-4 mx-auto">
                <h1 className="text-2xl font-bold text-center mb-6">Transaction Dashboard</h1>

                <TransactionTable transactions={transactions} />

                <Pagination
                    transactionsPerPage={transactionsPerPage}
                    totalTransactions={totalTransactions}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            </div>
        </>
    );
}
