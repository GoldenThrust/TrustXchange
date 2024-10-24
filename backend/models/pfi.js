import { Schema, model } from "mongoose";


const PFISchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true, unique: true },
    pfiDid: { type: String, required: true, unique: true },
    active: { type: Boolean, default: false },
}, { timestamps: true })

const PFI = model("PFI", PFISchema);

export default PFI;
