import { API_response } from "../utils/API_response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck= asyncHandler(async (req,res)=>{
    return res.status(200).json(new API_response(200,"ok","healthCheck passed !!!"))
})

export {healthCheck};