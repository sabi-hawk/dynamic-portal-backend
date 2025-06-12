import * as yup from "yup";
import { Request } from "express";
import Student from "@models/Student";

export const validateRegisterRequest = async (req: Request) => {
  let { username, email } = req.body;

  // If username is missing but email is present, generate a default username
  if (!username && typeof email === "string") {
    const emailPrefix = email.split("@")[0];
    req.body.username = emailPrefix;
  }

  const baseSchema = yup.object({
    username: yup.string().required("username is required"),
    email: yup.string().email("not a valid email").trim().lowercase().required("email is required"),
    password: yup.string().required("password is required"),
    role: yup.string().required("role is required"),
    name: yup.string().required("name is required"),
  });

  // Validate base structure first
  const baseData = await baseSchema.validate(req.body, { abortEarly: false });

  // Extend validation based on role
  if (baseData.role === "student") {
    // Count existing students to determine the next roll number
    const count = await Student.countDocuments();
    req.body.rollNo = count + 1;
    const studentSchema = yup.object({
      rollNo: yup.string().required("rollNo is required"),
      department: yup.string().required("department is required"),
      gender: yup.string().required("gender is required"),
      mobile: yup.string().required("mobile is required"),
      admissionDate: yup.date().required("admissionDate is required"),
    });

    const studentData = await studentSchema.validate(req.body, { abortEarly: false });

    return { ...baseData, studentData };
  }

  if (baseData.role === "teacher") {
    const teacherSchema = yup.object({
      department: yup.string().required("department is required"),
      mobile: yup.string().required("mobile is required"),
      address: yup.string().optional(),
      status: yup.string().oneOf(["active", "inactive"]).optional(),
      joiningDate: yup.date().required("joining date is required"),
      gender: yup.string().oneOf(["Male", "Female", "Other"]).required("gender is required"),
      degree: yup.string().oneOf(["Bachelors", "Masters", "PhD"]).required("degree is required"),
      section: yup.string().oneOf(["A", "B", "C", "D", "E", "F"]).required("section is required"),
    });

    const teacherData = await teacherSchema.validate(req.body, { abortEarly: false });

    return { ...baseData, teacherData };
  }

  return baseData;
};

export const validateLoginRequest = async (req: Request) => {
  const schema = yup.object().shape({
    email: yup.string().email("not a valid email").trim().lowercase().required("email is required"),
    password: yup.string().required("password is required")
  })

  return schema.validate(req.body, { abortEarly: false });
}