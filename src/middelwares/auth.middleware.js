//We created this middleware as it will take the access token being returned back from the user extract the user._id and perform logout with it

import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { API_error } from "../utils/API_error";
import { User } from "../models/user.models";

//here we are using _ instead of res as we dont need it here
export const  verifyJWT = asyncHandler(async (req,_,next)=>{
    try {
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","");
        const decodedToken = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            throw new API_error(401,"Unauthorized access")
        }
        //we create a new param as req is an object 
        req.user = user;
    
        next()
    } catch (error) {
        throw new API_error(401, error?.message || "Invalid Access Token")
    }
})