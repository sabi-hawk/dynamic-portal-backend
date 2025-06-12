import express from "express";
import {
  getPortalSettings,
  updatePortalSettings,
} from "../../controllers/settings";
import { authenticateJwt } from "../../middlewares/auth";

const router = express.Router();

// Apply authentication middleware to all settings routes
router.use(authenticateJwt);

// Portal settings routes
router.get("/portal", getPortalSettings);
router.put("/portal", updatePortalSettings);

export default router;
