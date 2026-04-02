import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import user from "./routes/userroute.js";
import campaign from "./routes/campaignroute.js";
import admin from "./routes/adminroute.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://give-help-frontend-g6nz.vercel.app",
      process.env.CLIENT_URL
    ],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", user);
app.use("/campaign", campaign);
app.use("/admin", admin);

app.get("/", (req, res) => {
  res.send("GiveHelp Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});