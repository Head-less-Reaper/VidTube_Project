import { asyncHandler } from "../utils/asyncHandler.js";
import { API_error } from "../utils/API_error.js";
import { User } from "../models/user.models.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middelwares/multer.middelware.js";
import { API_response } from "../utils/API_response.js";
import jwt from "jsonwebtoken"; 
import mongoose from "mongoose";

const generateAccessandRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new API_error(400,"User not found")
        }
        const accessToken = user.generateAccessToken();
        const refershToken = user.generateRefereshToken();
    
        //refersh token is directly passed in the user object
        user.refershToken=refershToken;
        await user.save({validateBeforeSave:false});
        return ({refershToken,accessToken});
    } catch (error) {
        throw new API_error(500 ,"Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler( async (req,res)=>{
    const {fullname , email ,username,password } = req.body;
    // console.log("BODY:", req.body);
    // console.log("FILES:", req.files);

    //validation
    if(
        [fullname,email,username,password].some((field) => field?.trim() === "")
    ){
        throw new API_error(400,"All fields are required")
    }

    const existedUser = await User.findOne({
        //$or : at least one of the condition should be true.
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new API_error(409,"User with this username or email already exist !!")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    console.log("Avatar"+ avatarLocalPath);
    
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new API_error(400,"Avatar file is missing");
        
    }
    // const avatar = await uploadToCloudinary(avatarLocalPath)

    // const coverImage = ""
    // if(coverImage){
    //     coverImage = await uploadToCloudinary(coverImage)
    // }

    let avatar;
    try {
        avatar = await uploadToCloudinary(avatarLocalPath)
    } catch (error) {
        console.log("Error uploading avatar",error);
        throw new API_error(500,"Avtar file missing !!")
        
    }
    let coverImage;
    try {
        coverImage = await uploadToCloudinary(coverImageLocalPath)
    } catch (error) {
        console.log("Error uploading coverImage",error);
        throw new API_error(500,"coverImage file missing !!")
        
    }
   


   try {
     const user = await User.create({
         fullname,
         avatar:avatar.url,
         coverImage:coverImage?.url||"",
         email,
         password,
         username:username.toLowerCase()
     })
 
     const createdUser = await User.findById(user._id).select("-password -refershToken")
     if (!createdUser){
         throw new API_error(500,"Something went wrong while resigistring the user")
     }   
 
     //giving the res to frontend
     return res.status(201).json(new API_response(200,createdUser,"User registered successfully"))
   
   } catch (error) {
        console.log("User creation failed");
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }
        throw new API_error(500,"Something went wrong while resigistring the user while creating the user")
   }
    
})

const loginUser = asyncHandler(async (req,res)=>{
    
    //get data
    const {email,username,password}=req.body;
    //validation
    if(!email)throw new API_error(400,"email is required !!");
    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user) throw new API_error(404,"user not found");

    const isPasswordValid = await User.isPasswordCorrect(password);

    if(!isPasswordValid) throw new API_error(401,"invalid credentials");

    const {accessToken,refershToken} = await generateAccessandRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refershToken");

    if(!loggedInUser) throw new API_error(400 ,"user not found");

    const options ={
        httpOnly : true ,
        secure : process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .cookie("access Token",accessToken,options)
    .cookie("refresh Token",refershToken,options)
    .json(new API_response(
        200,
        {user: loggedInUser,accessToken,refershToken}, //here we are sending the refresh token for mobile users as we cannot send cookies when user is logged in mobile.
        "User logged in successfully"
    ))

})

//for generating new access and refresh token after their expiry
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refershToken || req.body.refershToken; 
    //here from web we are taking refreshtoken from cookies while for mobile devices we are taking it directly from body

    //validation
    if(!incomingRefreshToken) throw new API_error(401, "refresh Token required");

    try {
        // here we are verifying if the referesh token incoming has the same secretkey as that which we have stored in our env file
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

        //generating new access and refersh token
        const {accessToken, refershToken:newRefreshToken} = await generateAccessandRefreshToken(decodedToken?._id); //error chances
         const user = await User.findById(decodedToken?._id);

    
        user.refershToken=refershToken;
        await user.save({validateBeforeSave:false});
        
        return res
        .status(200)
        .cookie("access Token",accessToken,options)
        .cookie("refresh Token",newRefreshToken,options)
        .json( new API_response(200,{accessToken,refershToken:newRefreshToken}, "Access token refreshed successfully"))
    } catch (error) {
        throw new API_error(500,"something went wrong while refreshing access token")
    }

})

const logoutUser =asyncHandler(async (req,res)=>{

    await User.findByIdAndUpdate(
        req.user._id,//here the user is defined byt he auth middleware
        //we are updating the refresh token for this user to null
        {
            $set:{
                refershToken:undefined
            }
        },
        {new:true}//updating the db 
    )
    const options= {
        httpOnly:true,
        secure:process.env.NODE_ENV ==="production"
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new API_response(200,{},"User loggedout successfully !!"))
})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword} = req.body;

    const user = await User.findById(user?._id);

    const validPassword = await user.isPasswordCorrect(oldPassword);

    if(!validPassword) throw new API_error(401,"Old password is incorrect !!")

    //updating the password : here the password which is being updated in plain text is automatically being hashed from the prehook we have designed in user.model
    user.password=newPassword;

    await user.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(200,{},"Password changed succesfully !!")

})

const currentUser = asyncHandler(async (req,res)=>{
    return res.status(200).json(new API_response(200,req.user,"Current User details !!"));
})

const updateAccountDetails= asyncHandler(async(req,res)=>{  
    const {fullname,username}=req.body;
    if(!fullname || !username) throw new API_error(400,"fullname and username is required");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                username:username.toLowerCase()
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    return res.status(200).json(new API_response(200,user,"Account details updated successfully"));
})

const updateAvatar= asyncHandler(async(req,res)=>{
    const avatarFileLocalPath = req.file?.path;

    if (!avatarFileLocalPath) {
        throw new API_error(400,"File is required .");

    }
    const avatar = await uploadToCloudinary(avatarFileLocalPath);

    if(!avatar.url) throw new API_error(500,"Something went wrong on the server side !!");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password -refershToken");

    return res.status(200).json(new API_response(200,user,"Avatar updated successfully"));
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath =req.files?.path;

    if(!coverImageLocalPath)throw new API_error(400,"CoverImage is required !!");

    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!coverImage.url)throw new API_error(500,"Something went wrong on the server side !!");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true},
    ).select("-password -refreshToken")

    return res.status(200).json(new API_response(200,user,"cover image upsated successfully !!"));
})

const channel = asyncHandler(async(req,res)=>{
    const {username} = req.params; 
    //it extracts the required fileds from the urls
    if(!username?.trim())throw new API_error(400,"Usernotfound");

    const channel = await User.aggregate([
        {
            $match:{
                username:username.toLowerCase().trim()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscrbiersCount:{
                    $size:"$subscribers"
                },
                channelsubscribedTo:{
                    $size:"$subscribedTo"
                },
                isSubscribedTo:{
                    $cond:{
                        if:{$in:[req.users?._id,"subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                avatar:1,
                coverImage:1,
                subscrbiersCount:1,
                isSubscribedTo:1,
                channelsubscribedTo:1,
                email:1
            }
        }
    ])

    if(!channel?.length)throw new API_error(404,"channel not found");

    return res
    .status(200)
    .json(new API_response(200,channel[0],"channel profile fetched successfully"))
})

const getWatchHistory =asyncHandler(async(req,res)=>{
    const user = await User.aggregate(
        [
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup:{
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline:[
                        {
                            $lookup:{
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline:[
                                    {
                                        $project:{
                                            fullname:1,
                                            username:1,
                                            avatar:1
                                        }
                                    }
                                ]
                            }
                        },
                        {$addFields:{
                            owner:{
                                $arrayElemAt:["$owner",0]
                            }
                        }}
                    ]
                }
            }
        ]
    )
    return res.status(200).json(new API_response(200,user[0]?.watchHistory,"watch history fetched successfully"))
})

export{
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    currentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    channel,
    getWatchHistory

}