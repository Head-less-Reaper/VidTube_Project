import { Router } from "express";

import { upload } from "../middelwares/multer.middelware.js"
import { changeCurrentPassword, channel, currentUser, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar, updateCoverImage } from "../controllers/user.contrellers.js";
import { verifyJWT } from "../middelwares/auth.middleware.js";

//we injected the middleware in the routes

const router = Router()

//unsecured routes
router.route("/register").post(
    upload.fields([{
        name:"avatar",
        maxCount:1
    },{
        name:"coverImage",
        maxCount:1
    }]),
    registerUser)
router.route("/login").post(loginUser);
router.route("/referesh-token").post(refreshAccessToken);

//secured routes : here we are first injecting the auth middleware then the controller
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").post(verifyJWT,currentUser);

router.route("/c/:username").get(verifyJWT,channel)

router.route("/update-account").patch(verifyJWT,updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);
router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage);

router.route("/getWatchHistory").get(verifyJWT,getWatchHistory);

export default router;