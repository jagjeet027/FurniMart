import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connectDB = async ()=> {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI)
        console.log(
            "Database is Connected"
        )
    } catch (error) {
        console.log("Error Connecting to the database",error)
    }
}

export default connectDB;
