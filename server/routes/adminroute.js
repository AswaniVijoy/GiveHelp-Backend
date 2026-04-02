import { Router } from "express";
import { Campaign } from "../models/campaignmodel.js";
import { Donation } from "../models/donationmodel.js";
import { User } from "../models/usermodel.js";
import upload from "../middleware/upload.js";
import sharp from "sharp";
import { authenticate, isAdmin } from "../middleware/auth.js";

export const admin = Router();

admin.get("/campaigns", authenticate, isAdmin, async (req, res) => {
  try {
    const data = await Campaign.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

admin.post("/campaign", authenticate, isAdmin, upload.single("Image"), async (req, res) => {
  try {
    const { Title, Category, Target, Status, Description, CreatedBy } = req.body;
    if (!Title || !Target) return res.status(400).json({ msg: "Title and Target are required" });
    if (Number(Target) <= 0) return res.status(400).json({ msg: "Goal must be greater than 0" });
    const existing = await Campaign.findOne({ Title, isDeleted: false });
    if (existing) return res.status(400).json({ msg: "Campaign already exists" });
    let imageBase64 = null;
    if (req.file) {
      const compressed = await sharp(req.file.buffer).resize({ width: 500 }).jpeg({ quality: 70 }).toBuffer();
      imageBase64 = compressed.toString("base64");
    }
    await Campaign.create({
      Title, Category,
      Goal: Number(Target),
      Status: Status || "Active",
      Description: Description || "",
      Image: imageBase64,
      CreatedBy: CreatedBy || req.name,
      Raised: 0,
    });
    res.status(201).json({ msg: "Campaign created successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

admin.put("/campaign/:id", authenticate, isAdmin, upload.single("Image"), async (req, res) => {
  try {
    const { Title, Category, Target, Status, Description } = req.body;
    const updateData = { Title, Category, Goal: Number(Target), Status, Description };
    if (req.file) {
      const compressed = await sharp(req.file.buffer).resize({ width: 500 }).jpeg({ quality: 70 }).toBuffer();
      updateData.Image = compressed.toString("base64");
    }
    await Campaign.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ msg: "Campaign updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

admin.delete("/campaign/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        Status: "Archived"
      },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ msg: "Campaign not found" });
    }

    res.json({ msg: "Campaign archived successfully" });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

admin.get("/donations", authenticate, isAdmin, async (req, res) => {
  try {
    const donations = await Donation.find();
    const donorNames = [...new Set(donations.map((d) => d.Donar).filter(Boolean))];
    const users = await User.find({ UserName: { $in: donorNames } }).select("UserName ProfilePicture");
    const avatarMap = {};
    users.forEach((u) => { avatarMap[u.UserName] = u.ProfilePicture || null; });
    const enriched = donations.map((d) => ({ ...d.toObject(), avatarBase64: avatarMap[d.Donar] || null }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

admin.get("/dashboard", authenticate, isAdmin, async (req, res) => {
  try {
    const campaignCount = await Campaign.countDocuments({ isDeleted: false });
    const donationCount = await Donation.countDocuments();
    const totalRaised = await Donation.aggregate([{ $group: { _id: null, total: { $sum: "$Amount" } } }]);
    res.status(200).json({
      Campaigns: campaignCount,
      Donations: donationCount,
      TotalRaised: totalRaised[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
