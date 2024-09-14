import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { Header } from '../Authentication/header';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PFIStat() {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            const response = await axios.get('xchange/getpfistats');
            const data = await response.data;
            setStats(data);
        };
        fetchStats();
    }, []);

    const renderStats = () => {
        return stats.map((stat, index) => {
            const pieChartData = {
                labels: ['Success Rate', 'Cancellation Rate'],
                datasets: [
                    {
                        label: stat.pfiName,
                        data: [parseFloat(stat.successRate), parseFloat(stat.cancellationRate)],
                        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                        hoverBackgroundColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                    },
                ],
            };

            return (
                <div key={index} className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-center">{stat.pfiName}</h2>

                    <div className="text-center mb-6">
                        <p className="text-gray-700">Total Transactions: <span className="font-semibold">{stat.totalTransactions}</span></p>
                        <p className="text-gray-700">Canceled Transactions: <span className="font-semibold">{stat.canceledTransactions}</span></p>
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className='w-72 h-72'>
                            <Pie
                                data={pieChartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="container mx-auto p-4">
            <Header/>
            <h1 className="text-2xl font-bold text-center mb-8">Statistics Overview</h1>
            <div className='grid grid-cols-3 gap-3'>
            {stats.length > 0 ? renderStats() : <p className="text-center">Loading statistics...</p>}
            </div>
        </div>
    );
};