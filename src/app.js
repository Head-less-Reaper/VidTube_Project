import express from "express";
import cors from "cors";
import healthChecRouter from "./routes/healthCheck.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import cookieParser from "cookie-parser";
import { errorHandler } from "./middelwares/error.middleware.js";

const app = express();

// ✅ Enable CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// ✅ Parse JSON & URL Encoded data (for non-file routes)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// ✅ Serve static files from public/
app.use(express.static("public"));

// ✅ Parse cookies
app.use(cookieParser());

// ✅ Routes
app.use("/api/v1/healthcheck", healthChecRouter);
console.log("healthcheck : /api/v1/healthcheck/test");

// ✅ File upload routes (multer handles form-data)
app.use("/api/v1/user", userRouter);
app.use("api/v1/videos",videoRouter);
app.use("api/v1/tweet",tweetRouter);
// app.use(errorHandler);
export { app };
