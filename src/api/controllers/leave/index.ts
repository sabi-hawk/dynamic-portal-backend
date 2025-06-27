import { Request, Response } from "express";
import LeaveRequest from "@models/LeaveRequest";
import CourseSchedule from "@models/CourseSchedule";
import Student from "@models/Student";
import Teacher from "@models/Teacher";
import { httpMethod, HttpError } from "..";
import { getIsoWeekRange } from "@utils/date";

// ************** STUDENT ************** //

// Fetch student's leave requests (current or past)
export const getStudentLeaves = httpMethod(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    const leaves = await LeaveRequest.find({ student: studentId })
      .populate({
        path: "courseSchedule",
        populate: { path: "course", select: "courseCode courseName" },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(leaves);
  }
);

// Create a new leave request
export const createLeaveRequest = httpMethod(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    const { courseScheduleId, requestedDay, reason } = req.body;

    if (!courseScheduleId || !requestedDay || !reason) {
      throw new HttpError(
        400,
        "courseScheduleId, requestedDay and reason are required"
      );
    }

    // Validate student and schedule relationship
    const student = await Student.findById(studentId);
    if (!student) throw new HttpError(404, "Student profile not found");

    const schedule = await CourseSchedule.findById(courseScheduleId);
    if (!schedule) throw new HttpError(404, "Course Schedule not found");

    // Must belong to same section as student
    if (schedule.section !== student.section) {
      throw new HttpError(
        403,
        "You cannot request leave for a schedule outside your section"
      );
    }

    // Requested day must be part of the schedule daysOfWeek
    if (!schedule?.schedule?.daysOfWeek?.includes(requestedDay)) {
      throw new HttpError(
        400,
        "requestedDay must be one of the schedule.daysOfWeek"
      );
    }

    const weekRange = getIsoWeekRange();

    // Optional: prevent duplicate request for same day & week
    const existing = await LeaveRequest.findOne({
      student: studentId,
      courseSchedule: courseScheduleId,
      requestedDay,
      "weekRange.start": weekRange.start,
    });
    if (existing) {
      throw new HttpError(
        409,
        "You have already requested leave for this lecture in the current week"
      );
    }

    const leave = await LeaveRequest.create({
      student: studentId,
      courseSchedule: courseScheduleId,
      requestedDay,
      reason,
      weekRange,
    });

    res.status(201).json({ message: "Leave request submitted", leave });
  }
);

// ************** TEACHER ************** //

// Get pending leaves for teacher's courses for current week
export const getTeacherLeaves = httpMethod(
  async (req: Request, res: Response) => {
    const teacherId = req.user?.id;

    // Validate teacher profile
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) throw new HttpError(404, "Teacher profile not found");

    const currentWeek = getIsoWeekRange();

    const leaves = await LeaveRequest.find({
      status: "pending",
      "weekRange.start": currentWeek.start,
    })
      .populate({
        path: "courseSchedule",
        match: { instructor: teacherId },
        populate: { path: "course", select: "courseCode courseName" },
      })
      .populate("student", "rollNo userId")
      .lean();

    // Filter out leaves whose courseSchedule did not match after populate
    const filtered = leaves.filter((l: any) => l.courseSchedule);

    res.status(200).json(filtered);
  }
);

// Accept / Reject leave
export const updateLeaveStatus = httpMethod(
  async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body; // accepted | rejected

    if (!status || !["accepted", "rejected"].includes(status)) {
      throw new HttpError(
        400,
        "status must be either 'accepted' or 'rejected'"
      );
    }

    const leave = await LeaveRequest.findById(id).populate("courseSchedule");
    if (!leave) throw new HttpError(404, "Leave request not found");

    // Ensure the teacher is instructor for this schedule
    if ((leave.courseSchedule as any).instructor.toString() !== teacherId) {
      throw new HttpError(
        403,
        "You are not allowed to modify this leave request"
      );
    }

    leave.status = status as any;
    await leave.save();

    res.status(200).json({ message: `Leave ${status}`, leave });
  }
);
