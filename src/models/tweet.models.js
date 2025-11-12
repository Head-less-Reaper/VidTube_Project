/*
id string pk
  owner ObjectId users
  content string
  createdAt Date
  updatedAt Date 
*/

import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true
    },
    updatedAt:{
        type:Date,
        required:true
    }
}
,{timestamps:true})

export const tweet =mongoose.model("tweet",tweetSchema)