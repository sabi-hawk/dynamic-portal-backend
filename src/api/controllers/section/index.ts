import { Request, Response } from "express";
import { httpMethod, HttpError } from "..";
import Section from "@models/Section";
import Class from "@models/Class";
import Student from "@models/Student";

/**
 * Section Controller - For School Institutes Only
 * Manages sections within classes (e.g., Section A, Section B, Red Section, etc.)
 */

// Add new section
export const addSection = httpMethod(async (req: Request, res: Response) => {
  const { classId, sectionName, description, capacity, status } = req.body;
  const userId = req.user?.id;

  // Verify the class exists and belongs to this institute
  const classData = await Class.findOne({ _id: classId, instituteId: userId });
  if (!classData) {
    throw new HttpError(404, "Class not found");
  }

  // Check if section already exists in this class
  const existingSection = await Section.findOne({
    sectionName,
    classId,
    instituteId: userId,
  });
  if (existingSection) {
    throw new HttpError(
      400,
      "Section with this name already exists in this class"
    );
  }

  // Create the section
  const newSection = await Section.create({
    classId,
    sectionName,
    description: description || "",
    capacity: capacity || 0,
    status: status || "active",
    instituteId: userId,
  });

  res.status(201).json({
    message: "Section added successfully",
    section: newSection,
  });
});

// Get all sections (optionally filter by classId)
export const getSections = httpMethod(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { classId } = req.query;

  let query: any = { instituteId: userId };
  if (classId) {
    query.classId = classId;
  }

  const sections = await Section.find(query)
    .populate("classId", "className description")
    .sort({ createdAt: -1 });

  res.status(200).json(sections);
});

// Get section by ID
export const getSectionById = httpMethod(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const section = await Section.findOne({
      _id: id,
      instituteId: userId,
    }).populate("classId", "className description");

    if (!section) {
      throw new HttpError(404, "Section not found");
    }

    res.status(200).json(section);
  }
);

// Update section
export const updateSection = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const updateData = req.body;

  // Find the section
  const section = await Section.findOne({ _id: id, instituteId: userId });
  if (!section) {
    throw new HttpError(404, "Section not found");
  }

  // If section name is being updated, check for duplicates
  if (
    updateData.sectionName &&
    updateData.sectionName !== section.sectionName
  ) {
    const existingSection = await Section.findOne({
      sectionName: updateData.sectionName,
      classId: section.classId,
      instituteId: userId,
      _id: { $ne: id },
    });
    if (existingSection) {
      throw new HttpError(
        400,
        "Section with this name already exists in this class"
      );
    }
  }

  // Update the section
  const updatedSection = await Section.findOneAndUpdate(
    { _id: id, instituteId: userId },
    {
      sectionName: updateData.sectionName,
      description: updateData.description,
      capacity: updateData.capacity,
      status: updateData.status,
      updatedAt: Date.now(),
    },
    { new: true }
  ).populate("classId", "className description");

  if (!updatedSection) {
    throw new HttpError(404, "Section not found");
  }

  res.status(200).json({
    message: "Section updated successfully",
    section: updatedSection,
  });
});

// Delete section
export const deleteSection = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  // Check if there are students in this section
  const studentsCount = await Student.countDocuments({ sectionId: id });
  if (studentsCount > 0) {
    throw new HttpError(
      400,
      `Cannot delete section. There are ${studentsCount} students in this section.`
    );
  }

  const section = await Section.findOneAndDelete({
    _id: id,
    instituteId: userId,
  });
  if (!section) {
    throw new HttpError(404, "Section not found");
  }

  res.status(200).json({
    message: "Section deleted successfully",
  });
});

// Get section statistics (students count, capacity utilization, etc.)
export const getSectionStatistics = httpMethod(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify the section belongs to the institute
    const section = await Section.findOne({
      _id: id,
      instituteId: userId,
    }).populate("classId", "className description");

    if (!section) {
      throw new HttpError(404, "Section not found");
    }

    // Get students count
    const studentsCount = await Student.countDocuments({ sectionId: id });

    // Get gender distribution
    const maleCount = await Student.countDocuments({
      sectionId: id,
      gender: "male",
    });
    const femaleCount = await Student.countDocuments({
      sectionId: id,
      gender: "female",
    });

    // Calculate capacity utilization
    const capacityUtilization =
      section.capacity > 0
        ? ((studentsCount / section.capacity) * 100).toFixed(2)
        : "N/A";

    res.status(200).json({
      section,
      studentsCount,
      genderDistribution: {
        male: maleCount,
        female: femaleCount,
      },
      capacity: section.capacity,
      capacityUtilization,
      availableSeats:
        section.capacity > 0 ? section.capacity - studentsCount : "N/A",
    });
  }
);

// Get all students in a section
export const getSectionStudents = httpMethod(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify the section belongs to the institute
    const section = await Section.findOne({ _id: id, instituteId: userId });
    if (!section) {
      throw new HttpError(404, "Section not found");
    }

    // Get all students in this section
    const students = await Student.find({ sectionId: id })
      .populate("userId", "name email")
      .populate("classId", "className")
      .sort({ rollNo: 1 });

    res.status(200).json(students);
  }
);
