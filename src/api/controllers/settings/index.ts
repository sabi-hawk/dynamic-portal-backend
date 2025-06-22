import { Request, Response } from "express";
import PortalSettings, {
  IPortalSettings,
} from "../../../models/PortalSettings";
import { httpMethod } from "..";
import featuresConfig from "@config/portal/features.json";

export const getPortalSettings = httpMethod(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const settings = await PortalSettings.findOne({ userId });

      if (!settings) {
        res.status(404).json({ success: false, message: "Settings not found" });
        return;
      }

      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      console.error("Error fetching portal settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch portal settings",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export const updatePortalSettings = httpMethod(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const updateData = { ...req.body };

      // Handle logo upload
      if (req.file) {
        const baseUrl =
          process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
        updateData.logoUrl = `${baseUrl}/uploads/logos/${req.file.filename}`;
      }

      // Parse permissions if they are sent as a string
      if (typeof updateData.portalPermissions === "string") {
        updateData.portalPermissions = JSON.parse(updateData.portalPermissions);
      }

      const settings = await PortalSettings.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, upsert: true }
      );

      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      console.error("Error updating portal settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update portal settings",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export const getPortalFeatures = httpMethod(
  async (req: Request, res: Response) => {
    const { instituteType = "school", portal } = req.query as Record<
      string,
      string
    >;
    const type = instituteType.toLowerCase();

    const dataForType = (featuresConfig as any)[type];
    if (!dataForType) {
      res.status(400).json({ message: "Invalid institute type" });
      return;
    }

    if (portal) {
      const list = dataForType[portal] || [];
      res.json(list);
      return;
    }

    res.json(dataForType);
  }
);
