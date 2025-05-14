// controllers/studentController.ts
import { Request, Response } from "express";
import Student from "@models/Student";
import { httpMethod } from "..";

export const addStudent = async (req: Request, res: Response) => {
  try {
    // Count existing students to determine the next roll number
    const count = await Student.countDocuments();

    const newStudent = new Student({
      ...req.body,
      rollNo: count + 1,
    });

    await newStudent.save();

    res.status(201).json({ message: "Student added successfully", student: newStudent });
  } catch (error) {
    res.status(500).json({ message: "Error adding student", error });
  }
};

export const getAllStudents = httpMethod(async (_req: Request, res: Response) => {
  const students = await Student.find()
    .populate({ path: 'userId', select: 'email' })
    .sort({ createdAt: -1 });

  const formattedStudents = students.map(student => {
    const studentObj = student.toObject();

    // Type assertion: tell TypeScript that userId is now of the expected populated type
    const user = studentObj.userId as { email?: string };

    return {
      ...studentObj,
      email: user?.email || null,
    };
  });

  res.status(200).json(formattedStudents);
});
