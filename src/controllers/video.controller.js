import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { API_error } from "../utils/API_error.js";
import { User } from "../models/user.models.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middelwares/multer.middelware.js";
import { API_response } from "../utils/API_response.js";
import jwt from "jsonwebtoken"; 
import mongoose from "mongoose";



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const videoQuery = {}

    if(userId){
        videoQuery.userId=userId
    }
    if(query){
        videoQuery.$or=[
            {title:{$regex:query,$options:"i"}},
            {description:{$regex:query,$options:"i"}}
        ]
    }
    const sortCriteria={}
    if (sortBy && sortType) {
        sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
    }
    const videos =await Video.find(query)
    .sort(sortCriteria)
    .skip(page*limit)
    .limit(limit)

    if(!videos){
        throw new API_error(400,"error")
    }
    return res.status(200).json(new API_response(200,videos,"fetched!!"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const getVideoLocalPath = req.files?.video[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!getVideoLocalPath || !thumbnailLocalPath){
        throw new API_error(400,"Please upload vailde files!!")
    }
     if (!title) {
        throw new API_error(400,"title is missing")
    }
    let video , thumbnail ;
    try {
        video = await uploadToCloudinary(getVideoLocalPath);
    } catch (error) {
        
        throw new API_error(500,"video file missing !!")
    }
    try {
        video = await uploadToCloudinary(thumbnailLocalPath);
    } catch (error) {
        
        throw new API_error(500,"thumnail file missing !!")
    }

    try {
        const video = await Video.create(
            {
                title,
                videoFile : video.url,
                thumbnail :thumbnail.url,
                duration : thumbnail.duration
            }
        )

    } catch (error) {
        throw new API_error(500,"Server side error")
    }
    video.owner = req.user?._id;
    video.save();

    console.log(video);

    return res.status(200).json(new API_response(200, video, "video uploaded successfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){throw new API_error(400,"video not found")}

    const video = await Video.findById(videoId);
    if(!video) throw new API_error(404,"Not found");
    return res.status(200).json(new API_response(200,video,"video of hte given ID"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description} = req.body
    const thumbnailLocalPath = req.file?.path
    //TODO: update video details like title, description, thumbnail
     if(!videoId) throw new API_error(404,"video not found");
    if(!thumbnailLocalPath)throw new API_error(400,"file required");
    const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
    if(!thumbnail)throw new API_error(500,"Server side error")
    const video =await Video.findByIdAndUpdate(
        req.video?._id,
        
        {
            $set:{
                videoId,
                title,
                description,
                thumbnail:thumbnail.url
            }
        },
        {new:true}
    )

    return res.status(200).json(new API_response(200,video,"updated"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
   const deleteVideo = await deleteFromCloudinary(videoId);
   if(!deleteVideo) throw new API_error(500,"server sider errror")
   await Video.findByIdAndDelete(videoId)

   return res.status(200).json(new API_response(200,{},"video deleted !!"))
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId){
        throw new API_error(400,"video is  missing")
    }
    const video = await Video.findById(videoId);
    //toggle
    video.isPublish  = !video.isPublish
    await video.save()
    return res.status(200).json(new API_response(200,{},"Publish Status toggled"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}