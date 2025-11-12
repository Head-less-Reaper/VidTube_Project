/* id string pk
  owner ObjectId users
  videos ObjectId[] videos
  name string
  description string
  createdAt Date
  updatedAt Date */

import mongoose, { Schema } from "mongoose";


const playlistSchema = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    createdAt:{
        type:Date,
        required:true
    },
    updatedAt:{
        type:Date,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ]
},{timestamps:true})

export const playlist = mongoose.model("playlist",playlistSchema)