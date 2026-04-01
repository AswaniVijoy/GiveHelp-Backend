import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { user } from "./routes/userroute.js";
import { campaign } from "./routes/campaignroute.js";
import { admin } from "./routes/adminroute.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

app.get("/", (req, res) => {
  res.json({ message: "GiveHelp API is running!" });
});

app.use("/user", user);
app.use("/campaign", campaign);
app.use("/admin", admin);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));