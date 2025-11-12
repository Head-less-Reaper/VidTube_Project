import { asyncHandlerfn } from "../utils/asyncHandlerfn.js";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

const connectDB = asyncHandlerfn(async ()=>{
     const connectionInstance =await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    console.log(`MongoDB connected \n host :${connectionInstance.connection.host}`);
    // return connectionInstance;
})
export default connectDB;