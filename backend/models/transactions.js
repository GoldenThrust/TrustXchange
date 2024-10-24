import { Schema, model } from "mongoose";

const TransactionsSchema = Schema({
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
        type: Schema.Types.Mixed,
        default: {}
    },
    quote: {
        type: Schema.Types.Mixed,
        ref: 'Quote',
        required: true
    },
    exchangeId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Processing"
    }
}, { timestamps: true })

const Transactions = model("Transactions", TransactionsSchema);

export default Transactions;
