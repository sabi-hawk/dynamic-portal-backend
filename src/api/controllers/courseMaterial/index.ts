import { Request, Response } from "express";
import { httpMethod, HttpError } from "..";
import CourseMaterial from "@models/CourseMaterial";
import CourseSchedule from "@models/CourseSchedule";
import path from "path";
import fs from "fs";

// Upload material
export const uploadMaterial = httpMethod(
  async (req: Request, res: Response) => {
    const { scheduleId } = req.body;
    if (!req.file) {
      throw new HttpError(400, "File is required");
    }
    // Verify schedule exists
    const schedule = await CourseSchedule.findById(scheduleId);
    if (!schedule) {
      throw new HttpError(404, "Course schedule not found");
    }
    // TODO: check permissions later
    const material = await CourseMaterial.create({
      courseSchedule: scheduleId,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: schedule.instructor,
    });

    res.status(201).json(material);
  }
);

// List materials by schedule
export const listMaterials = httpMethod(async (req: Request, res: Response) => {
  const { scheduleId } = req.query;
  const filter: any = {};
  if (scheduleId) filter.courseSchedule = scheduleId;
  const materials = await CourseMaterial.find(filter).sort({ createdAt: -1 });
  res.status(200).json(materials);
});

// Delete material
export const deleteMaterial = httpMethod(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const mat = await CourseMaterial.findById(id);
    if (!mat) throw new HttpError(404, "Material not found");
    // remove file
    const filePath = path.join(
      __dirname,
      "../../../../uploads",
      mat.storedName
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await CourseMaterial.findByIdAndDelete(id);
    res.status(200).json({ message: "Deleted" });
  }
);
