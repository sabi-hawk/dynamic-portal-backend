import { Request, Response } from "express";
import { httpMethod, HttpError } from "..";
import Course from "@models/Course";
import Teacher from "@models/Teacher";
import CourseSchedule from "@models/CourseSchedule";

// Add new course
export const addCourse = httpMethod(async (req: Request, res: Response) => {
  const { courseCode, courseName, description, status, schedules } = req.body;

  // Check if course code already exists
  const existingCourse = await Course.findOne({ courseCode });
  if (existingCourse) {
    throw new HttpError(400, "Course with this code already exists");
  }

  // Create the course (no instructor/section at course level)
  const course = await Course.create({
    courseCode,
    courseName,
    description,
    status: status || "active",
  });

  // Create schedules if provided
  let createdSchedules = [];
  if (Array.isArray(schedules)) {
    for (const sched of schedules) {
      // Validate instructor
      const instructorExists = await Teacher.findById(sched.instructor);
      if (!instructorExists) {
        throw new HttpError(
          404,
          `Instructor not found for schedule: ${sched.instructor}`
        );
      }
      // Create CourseSchedule
      const courseSchedule = await CourseSchedule.create({
        course: course._id,
        instructor: sched.instructor,
        section: sched.section,
        schedule: {
          startTime: sched.schedule.startTime,
          endTime: sched.schedule.endTime,
          daysOfWeek: sched.schedule.daysOfWeek,
          duration: 0, // will be set by pre-save hook
        },
        status: "active",
      });
      createdSchedules.push(courseSchedule);
    }
  }

  res.status(201).json({
    message: "Course added successfully",
    course,
    schedules: createdSchedules,
  });
});

// Get all courses
export const getCourses = httpMethod(async (_req: Request, res: Response) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.status(200).json(courses);
});

// Get course by ID
export const getCourseById = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) {
    throw new HttpError(404, "Course not found");
  }
  res.status(200).json(course);
});

// Get courses by instructor (deprecated, since instructor is not at course level)
export const getCoursesByInstructor = httpMethod(
  async (req: Request, res: Response) => {
    // This endpoint is now deprecated or should be refactored to use schedules
    res.status(400).json({
      message:
        "This endpoint is deprecated. Use schedule-based queries instead.",
    });
  }
);

// Update course
export const updateCourse = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // If course code is being updated, check for duplicates
  if (updateData.courseCode) {
    const existingCourse = await Course.findOne({
      courseCode: updateData.courseCode,
      _id: { $ne: id },
    });
    if (existingCourse) {
      throw new HttpError(400, "Course with this code already exists");
    }
  }

  // Update the course (only course-level fields)
  const updatedCourse = await Course.findByIdAndUpdate(
    id,
    {
      courseCode: updateData.courseCode,
      courseName: updateData.courseName,
      description: updateData.description,
      status: updateData.status,
      updatedAt: Date.now(),
    },
    { new: true }
  );

  if (!updatedCourse) {
    throw new HttpError(404, "Course not found");
  }

  // If schedules are present, replace all schedules for this course
  let createdSchedules = [];
  if (Array.isArray(updateData.schedules)) {
    // Delete all existing schedules for this course
    await CourseSchedule.deleteMany({ course: id });
    // Create new schedules
    for (const sched of updateData.schedules) {
      // Validate instructor
      const instructorExists = await Teacher.findById(sched.instructor);
      if (!instructorExists) {
        throw new HttpError(
          404,
          `Instructor not found for schedule: ${sched.instructor}`
        );
      }
      // Create CourseSchedule
      const courseSchedule = await CourseSchedule.create({
        course: id,
        instructor: sched.instructor,
        section: sched.section,
        schedule: {
          startTime: sched.schedule.startTime,
          endTime: sched.schedule.endTime,
          daysOfWeek: sched.schedule.daysOfWeek,
          duration: 0, // will be set by pre-save hook
        },
        status: "active",
      });
      createdSchedules.push(courseSchedule);
    }
  }

  res.status(200).json({
    message: "Course updated successfully",
    course: updatedCourse,
    schedules: createdSchedules,
  });
});

// Delete course
export const deleteCourse = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await Course.findByIdAndDelete(id);
  if (!course) {
    throw new HttpError(404, "Course not found");
  }
  // Cascade delete schedules
  await CourseSchedule.deleteMany({ course: id });
  res
    .status(200)
    .json({ message: "Course and related schedules deleted successfully" });
});

// Get all schedules for a course
export const getCourseSchedules = httpMethod(
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const schedules = await CourseSchedule.find({ course: courseId });
    res.status(200).json(schedules);
  }
);
