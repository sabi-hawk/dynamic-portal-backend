import { Request, Response } from "express";
import { httpMethod, HttpError } from "..";
import Class from "@models/Class";
import Section from "@models/Section";
import Student from "@models/Student";

/**
 * Class Controller - For School Institutes Only
 * Manages grade levels like Playgroup, Nursery, Prep, 1-10, etc.
 */

// Add new class
export const addClass = httpMethod(async (req: Request, res: Response) => {
  const { className, description, status } = req.body;
  const userId = req.user?.id;

  // Check if class already exists
  const existingClass = await Class.findOne({
    className,
    instituteId: userId,
  });
  if (existingClass) {
    throw new HttpError(400, "Class with this name already exists");
  }

  // Create the class
  const newClass = await Class.create({
    className,
    description: description || "",
    status: status || "active",
    instituteId: userId,
  });

  res.status(201).json({
    message: "Class added successfully",
    class: newClass,
  });
});

// Get all classes
export const getClasses = httpMethod(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const classes = await Class.find({ instituteId: userId }).sort({
    createdAt: -1,
  });
  res.status(200).json(classes);
});

// Get class by ID
export const getClassById = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const classData = await Class.findOne({ _id: id, instituteId: userId });
  if (!classData) {
    throw new HttpError(404, "Class not found");
  }
  res.status(200).json(classData);
});

// Update class
export const updateClass = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const updateData = req.body;

  // If class name is being updated, check for duplicates
  if (updateData.className) {
    const existingClass = await Class.findOne({
      className: updateData.className,
      instituteId: userId,
      _id: { $ne: id },
    });
    if (existingClass) {
      throw new HttpError(400, "Class with this name already exists");
    }
  }

  // Update the class
  const updatedClass = await Class.findOneAndUpdate(
    { _id: id, instituteId: userId },
    {
      className: updateData.className,
      description: updateData.description,
      status: updateData.status,
      updatedAt: Date.now(),
    },
    { new: true }
  );

  if (!updatedClass) {
    throw new HttpError(404, "Class not found");
  }

  res.status(200).json({
    message: "Class updated successfully",
    class: updatedClass,
  });
});

// Delete class
export const deleteClass = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  // Check if there are students in this class
  const studentsCount = await Student.countDocuments({ classId: id });
  if (studentsCount > 0) {
    throw new HttpError(
      400,
      `Cannot delete class. There are ${studentsCount} students enrolled in this class.`
    );
  }

  const classData = await Class.findOneAndDelete({
    _id: id,
    instituteId: userId,
  });
  if (!classData) {
    throw new HttpError(404, "Class not found");
  }

  // Cascade delete sections
  await Section.deleteMany({ classId: id });

  res.status(200).json({
    message: "Class and related sections deleted successfully",
  });
});

// Get all sections for a class
export const getClassSections = httpMethod(
  async (req: Request, res: Response) => {
    const { classId } = req.params;
    const userId = req.user?.id;

    // First, verify the class belongs to the institute
    const classData = await Class.findOne({
      _id: classId,
      instituteId: userId,
    });
    if (!classData) {
      throw new HttpError(
        404,
        "Class not found or you don't have permission to access it."
      );
    }

    const sections = await Section.find({ classId }).sort({ sectionName: 1 });
    res.status(200).json(sections);
  }
);

// Get class statistics (students count, sections count, etc.)
export const getClassStatistics = httpMethod(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify the class belongs to the institute
    const classData = await Class.findOne({ _id: id, instituteId: userId });
    if (!classData) {
      throw new HttpError(404, "Class not found");
    }

    // Get sections count
    const sectionsCount = await Section.countDocuments({ classId: id });

    // Get students count
    const studentsCount = await Student.countDocuments({ classId: id });

    // Get students by section
    const sections = await Section.find({ classId: id });
    const sectionStats = await Promise.all(
      sections.map(async (section) => ({
        sectionId: section._id,
        sectionName: section.sectionName,
        studentsCount: await Student.countDocuments({ sectionId: section._id }),
        capacity: section.capacity,
      }))
    );

    res.status(200).json({
      class: classData,
      sectionsCount,
      studentsCount,
      sectionStats,
    });
  }
);
