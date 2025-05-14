import { Request, Response } from "express";
import { httpMethod, HttpError } from "..";
import User from "@models/User";
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

export const getTeachers = httpMethod(async (_req: Request, res: Response) => {
  const teachers = await Teacher.find()
    .populate({ path: 'userId', select: 'email' })
    .sort({ createdAt: -1 });

  const formattedTeachers = teachers.map(teacher => {
    const teacherObj = teacher.toObject();

    // Type assertion: tell TypeScript that userId is now of the expected populated type
    const user = teacherObj.userId as { email?: string };

    return {
      ...teacherObj,
      email: user?.email || null,
    };
  });

  res.status(200).json(formattedTeachers);
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
