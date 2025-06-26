import { Request, Response } from "express";
import AttendanceSlot from "@models/AttendanceSlot";
import CourseSchedule from "@models/CourseSchedule";
import Student from "@models/Student";
import { httpMethod, HttpError } from "..";

// Teacher: mark attendance for a slot
export const markAttendance = httpMethod(
  async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const { courseScheduleId, date, slot, statuses } = req.body;

    if (!courseScheduleId || !date || !slot || !Array.isArray(statuses)) {
      throw new HttpError(400, "Missing fields");
    }

    // Verify schedule exists
    const sched = await CourseSchedule.findById(courseScheduleId);
    if (!sched) throw new HttpError(404, "Course schedule not found");

    // Upsert slot
    const doc = await AttendanceSlot.findOneAndUpdate(
      { courseSchedule: courseScheduleId, date, slot },
      {
        courseSchedule: courseScheduleId,
        date,
        slot,
        statuses,
        markedBy: teacherId,
        markedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(doc);
  }
);

// Teacher: view attendance for schedule
export const getAttendanceForSchedule = httpMethod(
  async (req: Request, res: Response) => {
    const { courseScheduleId } = req.query;
    if (!courseScheduleId)
      throw new HttpError(400, "courseScheduleId required");
    const records = await AttendanceSlot.find({
      courseSchedule: courseScheduleId,
    }).populate({
      path: "statuses.student",
      select: "rollNo userId",
      populate: { path: "userId", select: "name" },
    });
    res.status(200).json(records);
  }
);

// Student: get own attendance for course
export const getStudentAttendance = httpMethod(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    const { courseId } = req.query;
    if (!courseId) throw new HttpError(400, "courseId required");

    // find schedules for this course and student's section
    const schedules = await CourseSchedule.find({ course: courseId }).select(
      "_id section"
    );
    const scheduleIds = schedules.map((s) => s._id);

    const records = await AttendanceSlot.find({
      courseSchedule: { $in: scheduleIds },
      "statuses.student": studentId,
    })
      .select("courseSchedule date slot statuses")
      .lean();

    // Filter to only student's status
    const filtered = records.map((r: any) => {
      const statusObj = r.statuses.find(
        (s: any) => s.student.toString() === studentId
      );
      return {
        _id: r._id,
        courseSchedule: r.courseSchedule,
        date: r.date,
        slot: r.slot,
        status: statusObj?.status,
      };
    });

    res.status(200).json(filtered);
  }
);

// Teacher: get students for a schedule (to mark attendance)
export const getStudentsForSchedule = httpMethod(
  async (req: Request, res: Response) => {
    const { courseScheduleId } = req.query;
    if (!courseScheduleId)
      throw new HttpError(400, "courseScheduleId required");

    const sched = await CourseSchedule.findById(courseScheduleId);
    if (!sched) throw new HttpError(404, "Schedule not found");

    // fetch students of this section
    const students = await Student.find({ section: sched.section }).populate({
      path: "userId",
      select: "name",
    });
    res.status(200).json(students);
  }
);
