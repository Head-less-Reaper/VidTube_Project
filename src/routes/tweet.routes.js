import { Router } from "express";

import { verifyJWT } from "../middelwares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

const router =Router();
router.post("/", verifyJWT, createTweet);

router.get("/user/:userId", verifyJWT, getUserTweets);
router.patch("/:tweetId", verifyJWT, updateTweet);

router.delete("/:tweetId", verifyJWT, deleteTweet);

export default router;