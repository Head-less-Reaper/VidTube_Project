import mongoose, { isValidObjectId } from "mongoose";
import { tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { API_error } from "../utils/API_error.js";
import { API_response } from "../utils/API_response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const owner = req.user._id;

    if (!owner || !content) {
        throw new API_error(400, "Content is required");
    }

    const newTweet = await tweet.create({ owner, content });

    return res.status(200).json(
        new API_response(200, newTweet, "Tweet created")
    );
});


const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) throw new API_error(404, "User ID not found");

    const tweets = await tweet.find({ owner: userId }).sort({ createdAt: -1 });

    return res.status(200).json(
        new API_response(200, tweets, "Tweets fetched")
    );
});


const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId) throw new API_error(400, "Tweet ID is required");
    if (!content) throw new API_error(400, "Content is required");

    const tweetDoc = await tweet.findById(tweetId);
    if (!tweetDoc) throw new API_error(404, "Tweet not found");

    if (tweetDoc.owner.toString() !== req.user._id.toString()) {
        throw new API_error(403, "Not allowed to update this tweet");
    }

    tweetDoc.content = content;
    await tweetDoc.save();

    return res.status(200).json(
        new API_response(200, tweetDoc, "Tweet updated")
    );
});


const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) throw new API_error(400, "Tweet ID is required");

    const tweetDoc = await tweet.findById(tweetId);
    if (!tweetDoc) throw new API_error(404, "Tweet not found");

    if (tweetDoc.owner.toString() !== req.user._id.toString()) {
        throw new API_error(403, "Not allowed to delete this tweet");
    }

    await tweetDoc.deleteOne();

    return res.status(200).json(
        new API_response(200, {}, "Tweet deleted")
    );
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
