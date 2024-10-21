import { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from './Pagination.jsx';
import TransactionTable from './TransactionTable.jsx';
import { Header } from '../../components/Header.jsx';
import { Link } from 'react-router-dom';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(10);
    const [totalTransactions, setTotalTransactions] = useState(0);

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
            <Header className="flex justify-between px-10 my-5" >
                <Link to="/dashboard" className="hover:text-cyan-400 text-cyan-700 border-y-4">Dashboard</Link>
            </Header>
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
