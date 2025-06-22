import { Request, Response } from "express";
import { httpMethod, HttpError } from "..";
import CourseSchedule from "@models/CourseSchedule";

// Get course schedule detail by ID
export const getScheduleDetail = httpMethod(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const schedule = await CourseSchedule.findById(id)
      .populate("course", "courseCode courseName description status")
      .populate("instructor", "name email department");

    if (!schedule) {
      throw new HttpError(404, "Schedule not found");
    }

    res.status(200).json(schedule);
  }
);
