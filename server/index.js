import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ROUTES
import userRoutes from "./routes/userRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// LOAD ENV VARIABLES
dotenv.config();

const app = express();

// CORS CONFIGURATION
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

// BODY PARSER
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/user", userRoutes);
app.use("/campaign", campaignRoutes);
app.use("/admin", adminRoutes);

// ROOT ROUTE (for testing)
app.get("/", (req, res) => {
  res.send("GiveHelp API running successfully 🚀");
});

// PORT
const PORT = process.env.PORT || 5000;

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});