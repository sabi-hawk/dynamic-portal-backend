// controllers/studentController.ts
import { Request, Response } from "express";
import Student from "@models/Student";
import User from "@models/User";
import CourseSchedule from "@models/CourseSchedule";
import CourseMaterial from "@models/CourseMaterial";
import { httpMethod, HttpError } from "..";
import bcrypt from "bcrypt";

// Add new student
export const addStudent = httpMethod(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  // If classId and sectionId are provided (for schools), validate them
  if (req.body.classId) {
    const Class = (await import("@models/Class")).default;
    const classExists = await Class.findOne({
      _id: req.body.classId,
      instituteId: userId,
    });
    if (!classExists) {
      throw new HttpError(404, "Class not found");
    }
  }

  if (req.body.sectionId) {
    const Section = (await import("@models/Section")).default;
    const sectionExists = await Section.findOne({
      _id: req.body.sectionId,
      instituteId: userId,
    });
    if (!sectionExists) {
      throw new HttpError(404, "Section not found");
    }
  }

  // Auto-generate roll number if not provided
  let rollNo = req.body.rollNo;
  if (!rollNo) {
    const count = await Student.countDocuments({ instituteId: userId });
    rollNo = (count + 1).toString();
  }

  const newStudent = await Student.create({
    ...req.body,
    instituteId: userId,
    rollNo,
  });

  res
    .status(201)
    .json({ message: "Student added successfully", student: newStudent });
});

// Get all students
export const getStudents = httpMethod(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { classId, sectionId } = req.query;

  // Build query based on filters
  let query: any = { instituteId: userId };
  if (classId) query.classId = classId;
  if (sectionId) query.sectionId = sectionId;

  const students = await Student.find(query)
    .populate({ path: "userId", select: "email name" })
    .populate({ path: "classId", select: "className description" })
    .populate({ path: "sectionId", select: "sectionName" })
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

  // If classId is being updated (for schools), validate it
  if (updateData.classId) {
    const Class = (await import("@models/Class")).default;
    const classExists = await Class.findOne({
      _id: updateData.classId,
      instituteId: userId,
    });
    if (!classExists) {
      throw new HttpError(404, "Class not found");
    }
  }

  // If sectionId is being updated (for schools), validate it
  if (updateData.sectionId) {
    const Section = (await import("@models/Section")).default;
    const sectionExists = await Section.findOne({
      _id: updateData.sectionId,
      instituteId: userId,
    });
    if (!sectionExists) {
      throw new HttpError(404, "Section not found");
    }
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
  ).populate([
    { path: "classId", select: "className description" },
    { path: "sectionId", select: "sectionName" },
  ]);
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

    const Course = (await import("@models/Course")).default;
    const courseIds = (
      await Course.find({ instituteId: student.instituteId }).select("_id")
    ).map((c: any) => c._id);

    const schedules = await CourseSchedule.find({
      section: student.section,
      course: { $in: courseIds },
    })
      .populate("course", "courseCode courseName description status")
      .populate({
        path: "instructor",
        match: { instituteId: student.instituteId },
        select: "name department",
      })
      .sort({ "schedule.startTime": 1 })
      .lean();

    const filteredSchedules = schedules.filter(
      (s: any) => s.course && s.instructor
    );

    res.status(200).json(filteredSchedules);
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

    const Course = (await import("@models/Course")).default;
    const courseIds = (
      await Course.find({ instituteId: student.instituteId }).select("_id")
    ).map((c: any) => c._id);

    const todaySchedules = await CourseSchedule.find({
      section: student.section,
      course: { $in: courseIds },
      "schedule.daysOfWeek": today,
    })
      .populate("course", "courseCode courseName description status")
      .populate({
        path: "instructor",
        match: { instituteId: student.instituteId },
        select: "name department",
      })
      .sort({ "schedule.startTime": 1 })
      .lean();

    const filteredToday = todaySchedules.filter(
      (s: any) => s.course && s.instructor
    );

    res.status(200).json(filteredToday);
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
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Limit to courses that belong to the same institute
    const Course = (await import("@models/Course")).default;
    const coursesOfInstitute = await Course.find({
      instituteId: student.instituteId,
    }).select("_id");
    const courseIds = coursesOfInstitute.map((c: any) => c._id);

    // Get schedules for today for this student's section with nested population
    const todaySchedules = await CourseSchedule.find({
      section: student.section,
      course: { $in: courseIds },
      "schedule.daysOfWeek": today,
    })
      .populate("course", "courseCode courseName description status")
      .populate({
        path: "instructor",
        match: { instituteId: student.instituteId },
        populate: { path: "userId", select: "username name email" },
      })
      .sort({ "schedule.startTime": 1 })
      .lean();

    // remove any with null course or instructor after match
    const filteredToday = todaySchedules.filter(
      (s: any) => s.course && s.instructor
    );

    res.status(200).json(filteredToday);
  }
);

// Get student's courses (unique courses for their section)
export const getStudentCourses = httpMethod(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    console.log("Getting courses for student ID:", studentId);

    // First verify the student belongs to this institute and get their section
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      throw new HttpError(
        404,
        "Student not found or you don't have permission to access"
      );
    }
    console.log("Found student with section:", student.section);

    // limit courses to student's institute
    const Course = (await import("@models/Course")).default;
    const coursesOfInstitute = await Course.find({
      instituteId: student.instituteId,
    }).select("_id");
    const courseIds = coursesOfInstitute.map((c: any) => c._id);

    // Get schedules for this student's section and institute and populate course data
    const schedules = await CourseSchedule.find({
      section: student.section,
      status: "active",
      course: { $in: courseIds },
    })
      .populate("course", "courseCode courseName description status")
      .sort({ "course.courseName": 1 });

    console.log("Found schedules:", schedules.length);

    // Extract unique courses from schedules
    const uniqueCourses = schedules.reduce((acc: any[], schedule: any) => {
      const courseId = schedule.course?._id?.toString();
      const existingCourse = acc.find((c) => c._id === courseId);

      if (courseId && !existingCourse) {
        acc.push({
          _id: schedule.course._id,
          courseCode: schedule.course.courseCode,
          courseName: schedule.course.courseName,
          description: schedule.course.description,
          status: schedule.course.status,
          section: student.section,
        });
      }

      return acc;
    }, []);

    console.log("Unique courses found:", uniqueCourses.length);
    res.status(200).json(uniqueCourses);
  }
);

// Get course materials for a student filtered by course and section
export const getStudentCourseMaterials = httpMethod(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    const { courseId } = req.query;

    if (!courseId) {
      throw new HttpError(400, "courseId query param is required");
    }

    // Fetch student to identify their section
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      throw new HttpError(
        404,
        "Student not found or you don't have permission to access"
      );
    }

    // Find schedules that match this student's section and the requested course
    const schedules = await CourseSchedule.find({
      section: student.section,
      course: courseId,
      status: "active",
    }).select("_id");

    const scheduleIds = schedules.map((s) => s._id);

    // No schedules -> empty list
    if (scheduleIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Find materials belonging to those schedules
    const materials = await CourseMaterial.find({
      courseSchedule: { $in: scheduleIds },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "courseSchedule",
        select: "section course",
        populate: { path: "course", select: "courseCode courseName" },
      });

    res.status(200).json(materials);
  }
);
