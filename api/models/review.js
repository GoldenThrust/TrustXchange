import { Schema, model } from "mongoose";


const ReviewSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pfi: {
        type: Schema.Types.ObjectId,
        ref: 'PFI',
        required: true
    },
    transaction: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    comment: String,
}, { timestamps: true })

const Review = model("Review", ReviewSchema);

export default Review;
