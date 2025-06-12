// controllers/studentController.ts
import { Request, Response } from "express";
import Student from "@models/Student";
import User from "@models/User";
import { httpMethod, HttpError } from "..";
import bcrypt from "bcrypt";

// Add new student
export const addStudent = httpMethod(async (req: Request, res: Response) => {
  // Count existing students to determine the next roll number
  const count = await Student.countDocuments();
  const newStudent = await Student.create({
    ...req.body,
    rollNo: count + 1,
  });
  res.status(201).json({ message: "Student added successfully", student: newStudent });
});

// Get all students
export const getStudents = httpMethod(async (_req: Request, res: Response) => {
  const students = await Student.find()
    .populate({ path: 'userId', select: 'email name' })
    .sort({ createdAt: -1 });

  const formattedStudents = students.map(student => {
    const studentObj = student.toObject();
    const user = studentObj.userId as { email?: string; name?: { first: string; last: string } };
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
  // Find the student first to get their userId
  const student = await Student.findById(id);
  if (!student) {
    throw new HttpError(404, "Student not found");
  }
  // Delete the associated user by userId
  if (student.userId) {
    await User.findByIdAndDelete(student.userId);
  }
  // Delete the student
  await Student.findByIdAndDelete(id);
  res.status(200).json({ message: "Student and associated user deleted successfully" });
});

// Update student
export const updateStudent = httpMethod(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  // Find the student first
  const student = await Student.findById(id);
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
    student: updatedStudent
  });
});
