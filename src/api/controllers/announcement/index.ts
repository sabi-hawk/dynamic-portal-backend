import { Request, Response } from "express";
import Announcement from "@models/Announcement";
import Student from "@models/Student";
import Teacher from "@models/Teacher";
import { getInstituteId } from "@utils/index";


export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, description, tags, expiryDate } = req.body;
    let imageUrl = "";
    if (req.file) {
      const baseUrl =
        process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
      imageUrl = `${baseUrl}/uploads/announcement/${req.file.filename}`;
    }
    const createdBy = req.user?.id;
    const instituteId = req.user?.id;
    const announcement = await Announcement.create({
      title, description, tags, expiryDate, imageUrl, createdBy, instituteId
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create announcement" });
  }
};

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const instituteId = await getInstituteId(req.user?.id || "", req.user?.role || "");
    const announcements = await Announcement.find({ instituteId }).sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch announcements" });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, tags, expiryDate } = req.body;
    let imageUrl = "";
    if (req.file) {
      const baseUrl =
        process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
      imageUrl = `${baseUrl}/uploads/announcement/${req.file.filename}`;
    }
    const instituteId = req.user?.id;
    const updateData: any = { title, description, tags, expiryDate };
    if (imageUrl) updateData.imageUrl = imageUrl;
    const announcement = await Announcement.findOneAndUpdate({ _id: id, instituteId }, updateData, { new: true });
    res.json({ success: true, data: announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update announcement" });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const instituteId = req.user?.id;
    await Announcement.findOneAndDelete({ _id: id, instituteId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete announcement" });
  }
}; 