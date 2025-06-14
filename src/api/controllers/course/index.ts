import { Request, Response } from "express";
import { httpMethod, HttpError } from "..";
import Course from "@models/Course";
import Teacher from "@models/Teacher";

// Add new course
export const addCourse = httpMethod(async (req: Request, res: Response) => {
  const { courseCode, courseName, instructor, description, section } = req.body;

  // Check if course code already exists
  const existingCourse = await Course.findOne({ courseCode });
  if (existingCourse) {
    throw new HttpError(400, "Course with this code already exists");
  }

  // Verify if instructor exists
  const instructorExists = await Teacher.findById(instructor);
  if (!instructorExists) {
    throw new HttpError(404, "Instructor not found");
  }

  const course = await Course.create({
    courseCode,
    courseName,
    instructor,
    description,
    section
  });

  res.status(201).json({ message: "Course added successfully", course });
});

// Get all courses
export const getCourses = httpMethod(async (_req: Request, res: Response) => {
  const courses = await Course.find()
    .populate({
      path: 'instructor',
      select: 'userId department',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    })
    .sort({ createdAt: -1 });

  res.status(200).json(courses);
});

// Get course by ID
export const getCourseById = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const course = await Course.findById(id)
    .populate({
      path: 'instructor',
      select: 'userId department',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    });

  if (!course) {
    throw new HttpError(404, "Course not found");
  }

  res.status(200).json(course);
});

// Get courses by instructor
export const getCoursesByInstructor = httpMethod(async (req: Request, res: Response) => {
  const { instructorId } = req.params;

  const courses = await Course.find({ instructor: instructorId })
    .populate({
      path: 'instructor',
      select: 'userId department',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    })
    .sort({ createdAt: -1 });

  res.status(200).json(courses);
});

// Update course
export const updateCourse = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // If instructor is being updated, verify the new instructor exists
  if (updateData.instructor) {
    const instructorExists = await Teacher.findById(updateData.instructor);
    if (!instructorExists) {
      throw new HttpError(404, "Instructor not found");
    }
  }

  // If course code is being updated, check for duplicates
  if (updateData.courseCode) {
    const existingCourse = await Course.findOne({ 
      courseCode: updateData.courseCode,
      _id: { $ne: id }
    });
    if (existingCourse) {
      throw new HttpError(400, "Course with this code already exists");
    }
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: Date.now() },
    { new: true }
  ).populate({
    path: 'instructor',
    select: 'userId department',
    populate: {
      path: 'userId',
      select: 'name email'
    }
  });

  if (!updatedCourse) {
    throw new HttpError(404, "Course not found");
  }

  res.status(200).json({ 
    message: "Course updated successfully", 
    course: updatedCourse 
  });
});

// Delete course
export const deleteCourse = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const course = await Course.findByIdAndDelete(id);
  if (!course) {
    throw new HttpError(404, "Course not found");
  }

  res.status(200).json({ message: "Course deleted successfully" });
}); 