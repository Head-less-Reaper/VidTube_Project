/* 
id string pk
  video ObjectId videos
  owner ObjectId users
  content string
  createdAt Date
  updatedAt Date
*/

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const commentSchema = new Schema({
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
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
    content:{
        type:String,
        required:true
    }
},{timestamps:true})

commentSchema.plugin(mongooseAggregatePaginate)

export const comment  =  mongoose.model("comment",commentSchema)