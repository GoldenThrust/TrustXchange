import { Schema, model } from "mongoose";


const DevelopersSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    publicKey: { type: String, required: true, unique: true },
    privateKey: { type: String, required: true, unique: true },
    active: { type: Boolean, default: false },
}, { timestamps: true })

const PFI = model("Developers", DevelopersSchema);

export default PFI;
