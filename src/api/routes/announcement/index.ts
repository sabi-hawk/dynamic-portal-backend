import express from "express";
import { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement } from "@controllers/announcement";
import { authenticateJwt } from "@middlewares/auth";
import { uploadAnnouncementImage } from "@middlewares/fileUploader";
// import { adminOnlyMiddleware } from "@middlewares/admin"; // Placeholder for admin check
// import multer from "multer"; // Placeholder for image upload
const router = express.Router();

router.use(authenticateJwt);

// const upload = multer({ dest: "uploads/announcements/" });

// router.post("/", adminOnlyMiddleware, upload.single("image"), createAnnouncement);
router.post("/", uploadAnnouncementImage.single("announcement"), createAnnouncement); // TODO: add adminOnlyMiddleware
router.get("/", getAnnouncements);
// router.put("/:id", adminOnlyMiddleware, upload.single("announcements"), updateAnnouncement);
router.put("/:id", uploadAnnouncementImage.single("announcement"), updateAnnouncement); // TODO: add adminOnlyMiddleware
// router.delete("/:id", adminOnlyMiddleware, deleteAnnouncement);
router.delete("/:id", deleteAnnouncement); // TODO: add adminOnlyMiddleware

export default router; 