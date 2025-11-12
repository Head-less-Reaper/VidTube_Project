import { Router } from "express";
import { verifyJWT } from "../middelwares/auth.middleware";
import { upload } from "../middelwares/multer.middelware";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller";

const router =Router()

router.route("/uploadVideos").post(verifyJWT,
    upload.fields([{name:"thumbnail",maxCount:1},{name:"videoFile",maxCount:1}])
    ,publishAVideo);

router.route("/").get(getAllVideos);

router.route("/vid/:videoId").get(getVideoById);

router.route("/updateVid").patch(verifyJWT,upload.single("thumbnail"),updateVideo);

router.route("/delVid").post(verifyJWT,deleteVideo);

router.route("/togglePublisher").post(verifyJWT,togglePublishStatus)


export default router;