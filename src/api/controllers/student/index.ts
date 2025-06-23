// controllers/studentController.ts
import { Request, Response } from "express";
import Student from "@models/Student";
import User from "@models/User";
import CourseSchedule from "@models/CourseSchedule";
import { httpMethod, HttpError } from "..";
import bcrypt from "bcrypt";

// Add new student
export const addStudent = httpMethod(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  // Count existing students in this institute to determine the next roll number
  const count = await Student.countDocuments({ instituteId: userId });
  const newStudent = await Student.create({
    ...req.body,
    instituteId: userId,
    rollNo: count + 1,
  });
  res
    .status(201)
    .json({ message: "Student added successfully", student: newStudent });
});

// Get all students
export const getStudents = httpMethod(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const students = await Student.find({ instituteId: userId })
    .populate({ path: "userId", select: "email name" })
    .sort({ createdAt: -1 });

  const formattedStudents = students.map((student) => {
    const studentObj = student.toObject();
    const user = studentObj.userId as {
      email?: string;
      name?: { first: string; last: string };
    };
    return {
      ...studentObj,
      email: user?.email || null,
      name: user?.name || null,
    };
  });

  res.status(200).json(formattedStudents);
});

// Delete student
export const deleteStudent = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  // Find the student first to get their userId, ensuring it belongs to this institute
  const student = await Student.findOne({ _id: id, instituteId: userId });
  if (!student) {
    throw new HttpError(404, "Student not found");
  }
  // Delete the associated user by userId
  if (student.userId) {
    await User.findByIdAndDelete(student.userId);
  }
  // Delete the student
  await Student.findByIdAndDelete(id);
  res
    .status(200)
    .json({ message: "Student and associated user deleted successfully" });
});

// Update student
export const updateStudent = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const updateData = req.body;

  // Find the student first, ensuring it belongs to this institute
  const student = await Student.findOne({ _id: id, instituteId: userId });
  if (!student) {
    throw new HttpError(404, "Student not found");
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
    await User.findByIdAndUpdate(student.userId, userUpdate);
  }
  // Remove email and password from student update data
  const { email, password, ...studentUpdateData } = updateData;
  // Update the student record
  const updatedStudent = await Student.findByIdAndUpdate(
    id,
    studentUpdateData,
    { new: true }
  );
  res.status(200).json({
    message: "Student updated successfully",
    student: updatedStudent,
  });
});

// Get student profile by user ID
export const getStudentByUserId = httpMethod(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;

    // First verify the student belongs to this institute
    const student = await Student.findOne({ _id: studentId }).populate(
      "userId",
      "name email"
    );

    if (!student) {
      throw new HttpError(
        404,
        "Student not found or you don't have permission to access"
      );
    }
    res.status(200).json(student);
  }
);

// Get student's schedule (all courses for their section)
export const getStudentSchedule = httpMethod(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;

    // First verify the student belongs to this institute and get their section
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      throw new HttpError(
        404,
        "Student not found or you don't have permission to access"
      );
    }

    // Get all schedules for this student's section
    const schedules = await CourseSchedule.find({ section: student.section })
      .populate("course", "courseCode courseName description status")
      .populate("instructor", "name department")
      .sort({ "schedule.startTime": 1 });

    res.status(200).json(schedules);
  }
);

// Get student's today's schedules
export const getStudentTodaySchedules = httpMethod(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;

    // First verify the student belongs to this institute and get their section
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      throw new HttpError(
        404,
        "Student not found or you don't have permission to access"
      );
    }

    // Get current day of week
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // Get schedules for today for this student's section
    const todaySchedules = await CourseSchedule.find({
      section: student.section,
      "schedule.daysOfWeek": today,
    })
      .populate("course", "courseCode courseName description status")
      .populate("instructor", "name department")
      .sort({ "schedule.startTime": 1 });

    res.status(200).json(todaySchedules);
  }
);

// Get student's today's schedules with enriched instructor data
export const getStudentTodaySchedulesWithInstructor = httpMethod(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;

    // First verify the student belongs to this institute and get their section
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      throw new HttpError(
        404,
        "Student not found or you don't have permission to access"
      );
    }

    // Get current day of week
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // Get schedules for today for this student's section with nested population
    const todaySchedules = await CourseSchedule.find({
      section: student.section,
      "schedule.daysOfWeek": today,
    })
      .populate("course", "courseCode courseName description status")
      .populate({
        path: "instructor",
        populate: {
          path: "userId",
          select: "username name email",
        },
      })
      .sort({ "schedule.startTime": 1 });

    res.status(200).json(todaySchedules);
  }
);
