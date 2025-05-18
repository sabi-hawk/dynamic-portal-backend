import { Request, Response } from "express";
import PortalSettings, {
  IPortalSettings,
} from "../../../models/PortalSettings";
import { httpMethod } from "..";

export const getPortalSettings = httpMethod(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      let settings = await PortalSettings.findOne({ userId });

      if (!settings) {
        // Create default settings if none exist
        settings = await PortalSettings.create({ userId });
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

      const {
        instituteName,
        primaryColor,
        secondaryColor,
        logoUrl,
        address,
        contactEmail,
        contactPhone,
      } = req.body;

      const updateData: Partial<IPortalSettings> = {};

      if (instituteName !== undefined) updateData.instituteName = instituteName;
      if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
      if (secondaryColor !== undefined)
        updateData.secondaryColor = secondaryColor;
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
      if (address !== undefined) updateData.address = address;
      if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
      if (contactPhone !== undefined) updateData.contactPhone = contactPhone;

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
