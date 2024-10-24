import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Header } from '../../components/Header.jsx';
import { useSelector } from 'react-redux';
import { CheckCircle, XCircle, Star } from 'lucide-react';
import Comment from './Comment.jsx';
import { useState } from 'react';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PFIStat() {
    const { pfisStat } = useSelector((state) => state.xchange);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStat, setSelectedStat] = useState(null);

    const handleClick = async (stat) => {
        const res = await axios.get(`review?pfiname=${stat.pfiName}`);
        const data = res.data;
        setSelectedStat({ ...stat, reviews: data.review });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedStat(null);
    };


    const renderStats = () => {
        return pfisStat.map((stat, index) => {
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
                <div
                    key={index}
                    onClick={stat.totalReview > 0 ? () => handleClick(stat) : () => { }}
                    className="bg-white shadow-lg rounded-lg p-6 mb-6 transition transform hover:scale-105 hover:shadow-xl cursor-pointer"
                >
                    <h2 className="text-xl font-bold mb-4 text-center text-gray-800">{stat.pfiName}</h2>

                    <div className="text-center mb-6">
                        <div className="text-gray-700 flex items-center justify-center">
                            <CheckCircle className="mr-2 text-green-500" /> {/* Success Rate Icon */}
                            Total Transactions: <span className="font-semibold">{stat.totalTransactions}</span>
                        </div>
                        <div className="text-gray-700 flex items-center justify-center">
                            <XCircle className="mr-2 text-red-500" /> {/* Canceled Transactions Icon */}
                            Canceled Transactions: <span className="font-semibold">{stat.canceledTransactions}</span>
                        </div>
                        {stat.totalReview > 0 && (
                            <div className="mt-4">
                                <div className="text-gray-700 flex items-center justify-center">
                                    Review: <span className="font-semibold">{stat.totalReview}</span>
                                </div>
                                <div className="text-gray-700">Rating: <span className="font-semibold text-yellow-500 inline-flex place-items-center gap-1">{stat.averageRating}<Star size={15} /></span></div>
                                <div className="text-gray-700">Comment: <span className="font-semibold">{stat.totalComment}</span></div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className='w-full max-w-xs h-80'>
                            <Pie
                                data={pieChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
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
        <div className="container mx-auto p-4 overflow-hidden">
            <Header />
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Statistics Overview</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {pfisStat.length > 0 ? renderStats() : <p className="text-center text-gray-500">Loading statistics...</p>}
            </div>
            <Comment
                open={openDialog}
                onClose={handleCloseDialog}
                pfiName={selectedStat ? selectedStat.pfiName : ''}
                reviews={selectedStat ? selectedStat.reviews : []}
            />
        </div>
    );
}
