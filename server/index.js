import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://give-help-frontend-g6nz.vercel.app"
    ],
    credentials: true
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use("/campaign", campaignRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("GiveHelp API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});