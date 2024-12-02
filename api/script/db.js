import mongoose from "mongoose";

export default async function run() {
    try {
        await mongoose.connect("mongodb://0.0.0.0:27017/trustxchange", {
            autoIndex: true,
        });

        console.log("Successfully connected to MongoDB!");
    } catch (error) {
        console.error(error);
    }
}