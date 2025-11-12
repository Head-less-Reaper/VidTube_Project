import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
})
const PORT = process.env.PORT || 8005;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server is running at PORT : http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.log("❌ MongoDB connection error:", err);
    });
