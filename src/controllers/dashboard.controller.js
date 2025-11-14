import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { API_error } from "../utils/API_error";
import { API_response } from "../utils/API_response";
import { Video } from "../models/video.models";
import { like } from "../models/like.models";
import { subscription } from "../models/subscription.models";

const getChannelStats = asyncHandler(async (req,res)=>{
   
})
const getChannelVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const videoQuery = {};
    const sortCriteria = {};

    // filter by channel owner
    if (userId) {
        videoQuery.owner = userId;  
    }

    // search filter
    if (query) {
        videoQuery.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    // sort filter
    sortCriteria[sortBy] = sortType === "asc" ? 1 : -1;

    // fetch videos
    const videos = await Video.find(videoQuery)
        .sort(sortCriteria)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    // total count
    const totalVideos = await Video.countDocuments(videoQuery);

    return res
        .status(200)
        .json(
            new API_response(200, {
                page: pageNumber,
                limit: limitNumber,
                totalVideos,
                totalPages: Math.ceil(totalVideos / limitNumber),
                videos
            }, "videos fetched")
        );
});
