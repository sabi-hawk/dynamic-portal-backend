import { Request, Response } from "express";
import { httpMethod, HttpError } from "..";
import Teacher from "@models/Teacher";

// Add new teacher
export const addTeacher = httpMethod(async (req: Request, res: Response) => {
  const { name, department, mobile, email, address, status, joiningDate, gender, degree } = req.body;

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
  });

  res.status(201).json({ message: "Teacher added successfully", teacher });
});

// Get all teachers
export const getTeachers = httpMethod(async (_req: Request, res: Response) => {
  const teachers = await Teacher.find().sort({ createdAt: -1 });
  res.status(200).json(teachers);
});

// Delete teacher
export const deleteTeacher = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const teacher = await Teacher.findByIdAndDelete(id);
  if (!teacher) {
    throw new HttpError(404, "Teacher not found");
  }
  res.status(200).json({ message: "Teacher deleted successfully" });
});

// Update teacher
export const updateTeacher = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedTeacher = await Teacher.findByIdAndUpdate(id, req.body, { new: true });
  if (!updatedTeacher) {
    throw new HttpError(404, "Teacher not found");
  }
  res.status(200).json({ message: "Teacher updated", teacher: updatedTeacher });
});
