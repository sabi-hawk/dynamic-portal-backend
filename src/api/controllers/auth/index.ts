import { HttpError, httpMethod } from "..";
import { Request, Response } from "express";
import { validateLoginRequest, validateRegisterRequest } from "./validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SECRET } from "@config/app/index";
import User, { UserType } from "@models/User";
import Session from "@models/Session";
import Student from "@models/Student";
import Teacher from "@models/Teacher";
import PortalSettings from "@models/PortalSettings";

type BaseRegisterData = {
  role: string;
  name: string;
  email: string;
  password: string;
  username: string;
};

type StudentRegisterData = BaseRegisterData & {
  studentData: {
    rollNo: string;
    department?: string;
    program?: string;
    semester?: number;
    collegeYear?: string;
    schoolClass?: string;
    gender: string;
    mobile: string;
    admissionDate: Date;
  };
  role: "student";
};

type TeacherRegisterData = BaseRegisterData & {
  teacherData: {
    department?: string;
    mobile: string;
    address?: string;
    status?: "active" | "inactive";
    joiningDate?: Date;
    gender?: "Male" | "Female" | "Other";
    degree?: "Bachelors" | "Masters" | "PhD";
    section?: string;
  };
  role: "teacher";
};

type RegisterData =
  | BaseRegisterData
  | StudentRegisterData
  | TeacherRegisterData;

function isStudent(data: RegisterData): data is StudentRegisterData {
  return data.role === "student" && "studentData" in data;
}

function isTeacher(data: RegisterData): data is TeacherRegisterData {
  return data.role === "teacher" && "teacherData" in data;
}

export const register = httpMethod(
  async (req: Request, res: Response): Promise<void> => {
    const reqData = (await validateRegisterRequest(req)) as RegisterData;
    console.log("HERE0");
    const existingUser = await User.findOne({ email: reqData.email });
    console.log("HERE1");
    if (existingUser) {
      throw new HttpError(400, "Email Already Exists!");
    }

    console.log("HERE2");
    // For student/teacher registration, ensure user is authenticated
    if (
      (reqData.role === "student" || reqData.role === "teacher") &&
      !req.user?.id
    ) {
      throw new HttpError(
        401,
        "Authentication required for student/teacher registration"
      );
    }
    console.log("HERE3");
    // Parse name into first and last name
    const nameParts = reqData.name ? reqData.name.trim().split(" ") : ["", ""];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    console.log("HERE4");
    const hashedPassword = await bcrypt.hash(reqData.password, 10);
    console.log("HERE5");
    try {
      // Create user first
      const user = await User.create({
        ...reqData,
        password: hashedPassword,
        role: reqData.role,
        name: {
          first: firstName,
          last: lastName,
        },
      });
      console.log("HERE6");

      // Role-specific creation
      if (isStudent(reqData)) {
        console.log("HERE7");
        console.log(user._id);
        console.log("HERE7.1");
        console.log(req.user!.id);
        console.log("HERE7.2");
        console.log(reqData.studentData);
        console.log("HERE7.3");
        await Student.create({
          userId: user._id,
          instituteId: req.user!.id, // Safe to use ! here since we validated above
          ...reqData.studentData,
        });
      } else if (isTeacher(reqData)) {
        console.log("HERE8");
        // Extract only the teacher-specific fields
        const {
          department,
          mobile,
          address,
          status,
          joiningDate,
          gender,
          degree,
          section,
        } = reqData.teacherData;
        console.log("HERE9");
        await Teacher.create({
          userId: user._id,
          instituteId: req.user!.id, // Safe to use ! here since we validated above
          department,
          mobile,
          address,
          status,
          joiningDate,
          gender,
          degree,
          section,
          type: "teacher",
        });
      }
      console.log("HERE10");
      res.status(201).json({
        user: {
          name: user.name,
          email: user.email,
        },
        message: "Signed Up Successfully !",
      });
    } catch (error: any) {
      console.log("HERE11");
      // If anything fails, we should clean up the created user
      if (error.code === 11000) {
        throw new HttpError(
          400,
          "A teacher/Student with this information already exists"
        );
      }
      throw new HttpError(500, "Error creating user: " + error.message);
    }
  }
);

export const login = httpMethod(async (req: Request, res: Response) => {
  const reqData = await validateLoginRequest(req);
  const existingUser = await User.findOne({ email: reqData.email });

  if (!existingUser) {
    throw new HttpError(400, "User not Found!");
  }
  const matchPassword = await bcrypt.compare(
    reqData.password,
    existingUser.password
  );

  if (!matchPassword) {
    throw new HttpError(400, "Invalid Credentials !");
  }

  const user = {
    _id: existingUser._id,
    email: existingUser.email,
    username: existingUser.username,
    name: existingUser.name,
    role: existingUser.role,
  };
  const session = await createSession(existingUser);

  // Check if user is admin and get portal settings
  let settings = null;
  if (existingUser.role === "admin") {
    settings = await PortalSettings.findOne({ userId: existingUser._id });
  } else if (existingUser.role === "student") {
    const student = await Student.findOne({ userId: existingUser._id });
    if (student && student.instituteId) {
      settings = await PortalSettings.findOne({ userId: student.instituteId });
    }
  } else if (existingUser.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: existingUser._id });
    if (teacher && teacher.instituteId) {
      settings = await PortalSettings.findOne({ userId: teacher.instituteId });
    }
  }

  // Check portal permissions (if defined)
  if (
    existingUser.role === "student" &&
    settings?.portalPermissions?.studentPortal !== undefined &&
    !settings.portalPermissions.studentPortal.enabled
  ) {
    throw new HttpError(400, "Portal is not enabled for this user");
  }

  if (
    existingUser.role === "teacher" &&
    settings?.portalPermissions?.teacherPortal !== undefined &&
    !settings.portalPermissions.teacherPortal.enabled
  ) {
    throw new HttpError(400, "Portal is not enabled for this user");
  }

  res.status(200).json({
    user: { ...(user || {}) },
    token: session.accessToken,
    expiresAt: session.expiresAt,
    settings: settings,
    message: "Successfully LoggedIn!",
  });
});

export const changePassword = httpMethod(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          password: hashedPassword,
        },
      },
      { new: true }
    );

    if (!existingUser) {
      throw new HttpError(400, "User not Found!");
    }
    res
      .status(200)
      .json({ user: existingUser, message: "Password Changed Successfully!" });
  }
);

// update the current accessToken's time  again to which its ideally is
// export const refreshToken = httpMethod(async (req: Request, res: Response) => {

// })

// remove the current session from db
// export const logout = httpMethod(async (req: Request, res: Response) => {

// })

const createSession = async (user: UserType) => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  const newSession = await new Session({
    userId: user._id,
    expiresAt: expiresAt,
  }).save();
  const token = jwt.sign(
    {
      email: user.email,
      userId: user._id,
      sessionId: newSession._id,
      role: user.role,
    },
    SECRET
  );
  newSession.accessToken = token;
  return newSession.save();
};
