import { Request, Response } from "express";
import { httpMethod, HttpError } from "..";
import User from "@models/User";
import Teacher from "@models/Teacher";
import bcrypt from "bcrypt";
import CourseSchedule from "@models/CourseSchedule";
import Course from "@models/Course";

// Add new teacher
export const addTeacher = httpMethod(async (req: Request, res: Response) => {
  const {
    name,
    department,
    mobile,
    email,
    address,
    status,
    joiningDate,
    gender,
    degree,
    section,
  } = req.body;

  const existing = await Teacher.findOne({ email });
  if (existing) {
    throw new HttpError(400, "Teacher with this email already exists");
  }

  const teacher = await Teacher.create({
    name,
    department,
    mobile,
    email,
    address,
    status,
    joiningDate,
    gender,
    degree,
    section,
  });

  res.status(201).json({ message: "Teacher added successfully", teacher });
});

export const getTeachers = httpMethod(async (_req: Request, res: Response) => {
  const teachers = await Teacher.find()
    .populate({ path: "userId", select: "email name" })
    .sort({ createdAt: -1 });

  const formattedTeachers = teachers.map((teacher) => {
    const teacherObj = teacher.toObject();

    // Type assertion: tell TypeScript that userId is now of the expected populated type
    const user = teacherObj.userId as {
      email?: string;
      name?: { first: string; last: string };
    };

    return {
      ...teacherObj,
      email: user?.email || null,
      name: user?.name || null,
    };
  });

  res.status(200).json(formattedTeachers);
});

// Delete teacher
export const deleteTeacher = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Find the teacher first to get their userId
  const teacher = await Teacher.findById(id);
  if (!teacher) {
    throw new HttpError(404, "Teacher not found");
  }

  // Delete the associated user by userId
  if (teacher.userId) {
    await User.findByIdAndDelete(teacher.userId);
  }

  // Delete the teacher
  await Teacher.findByIdAndDelete(id);

  res
    .status(200)
    .json({ message: "Teacher and associated user deleted successfully" });
});

// Update teacher
export const updateTeacher = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Find the teacher first
  const teacher = await Teacher.findById(id);
  if (!teacher) {
    throw new HttpError(404, "Teacher not found");
  }

  // If email, password, or name is being updated, update the user record
  if (updateData.email || updateData.password || updateData.name) {
    const userUpdate: any = {};
    if (updateData.email) userUpdate.email = updateData.email;
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      userUpdate.password = hashedPassword;
    }
    if (updateData.name) userUpdate.name = updateData.name;
    await User.findByIdAndUpdate(teacher.userId, userUpdate);
  }

  // Remove email and password from teacher update data
  const { email, password, ...teacherUpdateData } = updateData;

  // Update the teacher record
  const updatedTeacher = await Teacher.findByIdAndUpdate(
    id,
    teacherUpdateData,
    { new: true }
  );

  res.status(200).json({
    message: "Teacher updated successfully",
    teacher: updatedTeacher,
  });
});

// Get teacher profile by user ID
export const getTeacherByUserId = httpMethod(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const teacher = await Teacher.findOne({ userId }).populate(
      "userId",
      "name email"
    );
    if (!teacher) {
      throw new HttpError(404, "Teacher not found");
    }
    res.status(200).json(teacher);
  }
);

// Get teacher's courses and schedules
export const getTeacherCoursesAndSchedules = httpMethod(
  async (req: Request, res: Response) => {
    const { teacherId } = req.params;

    // Get all schedules for this teacher
    const schedules = await CourseSchedule.find({ instructor: teacherId })
      .populate("course", "courseCode courseName description status")
      .sort({ "schedule.startTime": 1 });

    res.status(200).json(schedules);
  }
);

// Get teacher's today's schedules
export const getTeacherTodaySchedules = httpMethod(
  async (req: Request, res: Response) => {
    const { teacherId } = req.params;

    // Get current day of week
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // Get schedules for today
    const todaySchedules = await CourseSchedule.find({
      instructor: teacherId,
      "schedule.daysOfWeek": today,
    })
      .populate("course", "courseCode courseName description status")
      .sort({ "schedule.startTime": 1 });

    res.status(200).json(todaySchedules);
  }
);
