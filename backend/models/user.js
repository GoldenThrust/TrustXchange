import mongoose from "mongoose";

mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phonenumber: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zip: { type: String, required: true },
    did: { type: String, required: true },
    vc: { type: String, required: true },
    active: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
})

const User = mongoose.model("User", UserSchema);

export default User;
