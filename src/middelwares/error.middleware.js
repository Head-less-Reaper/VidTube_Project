import mongoose from "mongoose";
import { API_error } from "../utils/API_error.js";

const errorHandler = (err,req,res,next)=>{
    let error =err;
    if(!(error instanceof API_error)){
        const statusCode =error.statusCode || error instanceof mongoose.Error ? 400:500

        const message = error.message || "Something went wrong";

        error=new API_error(statusCode,message,error ?.errors ||[],err.stack )
    }
    const response ={
        ...error,//destructuring of error
        message:error.message,
        ...(process.env.NODE_ENV === "development" ? {
            stack : error.stack
        } :{})
    }
    return res.status(error.statusCode).json(response);
}

export {
    errorHandler
}