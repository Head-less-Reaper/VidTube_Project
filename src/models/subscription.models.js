/*id string pk
  subscriber ObjectId users
  channel ObjectId users
  createdAt Date
  updatedAt Date*/

import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
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
    }

}
,{timestamps:true})

export const subscription = mongoose.model("subscription",subscriptionSchema)