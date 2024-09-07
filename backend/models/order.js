import { Schema, model } from "mongoose";

const OrderSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true })

const Order = model("Order", OrderSchema);

export default Order;
