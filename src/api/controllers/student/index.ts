// controllers/studentController.ts
import { Request, Response } from "express";
import Student from "@models/Student";

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

export const getAllStudents = async (_req: Request, res: Response) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};
