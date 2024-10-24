import PFI from "../models/pfi.js";
import Review from "../models/review.js";
import Transactions from "../models/transactions.js";
class PfiReviewController {
    async getAllPFIStats(req, res) {
        try {
            const pfiStats = await Transactions.aggregate([
                {
                    $lookup: {
                        from: 'pfis',
                        localField: 'pfi',
                        foreignField: '_id',
                        as: 'pfi'
                    }
                },
                {
                    $unwind: '$pfi'
                },
                {
                    $group: {
                        _id: "$pfi._id",
                        pfiName: { $first: "$pfi.name" },
                        totalTransactions: { $sum: 1 },
                        canceledTransactions: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "CLOSED"] }, 1, 0]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        pfiName: 1,
                        totalTransactions: 1,
                        canceledTransactions: 1,
                        successRate: {
                            $cond: [
                                { $gt: ["$totalTransactions", 0] },
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                { $subtract: ["$totalTransactions", "$canceledTransactions"] },
                                                "$totalTransactions"
                                            ]
                                        }, 100
                                    ]
                                },
                                0
                            ]
                        },
                        cancellationRate: {
                            $cond: [
                                { $gt: ["$totalTransactions", 0] },
                                {
                                    $multiply: [
                                        {
                                            $divide: ["$canceledTransactions", "$totalTransactions"]
                                        }, 100
                                    ]
                                },
                                0
                            ]
                        }
                    }
                }
            ]);


            const reviews = await Review.aggregate([
                {
                    $lookup: {
                        from: 'pfis',
                        localField: 'pfi',
                        foreignField: '_id',
                        as: 'pfi'
                    }
                },
                {
                    $unwind: '$pfi'
                },
                {
                    $group: {
                        _id: "$pfi._id",
                        pfiName: { $first: "$pfi.name" },
                        totalReview: { $sum: 1 },
                        totalComment: {
                            $sum: {
                                $cond: [{ $ne: ["$comment", ""] }, 1, 0]
                            }
                        },
                        sumOfRatings: { $sum: "$rating" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        pfiName: 1,
                        totalReview: 1,
                        totalComment: 1,
                        sumOfRatings: 1,
                        averageRating: {
                            $cond: [
                                { $gt: ["$totalReview", 0] },
                                { $divide: ["$sumOfRatings", "$totalReview"] },
                                0
                            ]
                        }
                    }
                }
            ]);


            const response = pfiStats.map(pfi => {
                const review = reviews.find(r => r._id?.toString() === pfi._id?.toString());

                return {
                    pfiName: pfi.pfiName || 'Unknown PFI',
                    totalTransactions: pfi.totalTransactions,
                    canceledTransactions: pfi.canceledTransactions,
                    successRate: pfi.successRate?.toFixed(2) || "0.00",
                    cancellationRate: pfi.cancellationRate?.toFixed(2) || "0.00",
                    totalReview: review?.totalReview || 0,
                    totalComment: review?.totalComment || 0,
                    averageRating: review?.averageRating?.toFixed(2) || "0.00"
                };
            });

            return res.status(200).json(response);
        } catch (error) {
            console.error('Error fetching PFI stats:', error);
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }



    async reviewPFI(req, res) {
        const user = req.user;
        const { exchangeId, rating, comment } = req.body

        try {
            const transaction = await Transactions.findOne({ exchangeId });
            const review = new Review({ user, pfi: transaction.pfi, transaction, rating, comment: comment || '' });
            await review.save();
            res.status(201).json({ message: 'Review submitted successfully', review });
        } catch (error) {
            console.error('Error Reviewing PFI:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    }

    async getReview(req, res) {
        const { pfiname } = req.query;
        console.log(req.query);

        if (!pfiname)
            return res.status(400).json({ message: 'PFI name is required' });

        try {
            const pfi = await PFI.findOne({ name: pfiname });
            const review = await Review.find({ pfi });
            res.status(200).json({ message: 'Review fetched successfully', review });
        } catch (error) {
            console.error('Error fetching review:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    }
} const pfiReviewController = new PfiReviewController(); export default pfiReviewController;