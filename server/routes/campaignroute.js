import { Router } from "express";
import { Campaign } from "../models/campaignmodel.js";
import sharp from "sharp";

export const campaign = Router();

// Featured: active, non-deleted only
campaign.get("/featured", async (req, res) => {
  try {
    const data = await Campaign.find({ Status: "Active", isDeleted: false }).sort({ Raised: -1 }).limit(6);
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Category: active, non-deleted only
campaign.get("/category/:category", async (req, res) => {
  try {
    const data = await Campaign.find({ Category: req.params.category, Status: "Active", isDeleted: false });
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

campaign.get("/image/:title", async (req, res) => {
  try {
    const data = await Campaign.findOne({ Title: req.params.title, isDeleted: false });
    if (!data || !data.Image) return res.status(404).json({ msg: "Image not found" });
    const imageBuffer = Buffer.from(data.Image, "base64");
    const compressed = await sharp(imageBuffer).resize({ width: 400 }).jpeg({ quality: 70 }).toBuffer();
    res.set("Content-Type", "image/jpeg");
    res.send(compressed);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Explore: show ALL non-deleted campaigns (active AND closed) to users
campaign.get("/", async (req, res) => {
  try {
    const data = await Campaign.find({ isDeleted: false });
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Single campaign: show as long as not deleted
campaign.get("/:id", async (req, res) => {
  try {
    const data = await Campaign.findOne({ _id: req.params.id, isDeleted: false });
    if (!data) return res.status(404).json({ msg: "Campaign not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
