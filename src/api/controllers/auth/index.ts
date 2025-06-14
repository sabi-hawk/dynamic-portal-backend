import { HttpError, httpMethod } from "..";
import { Request, Response } from "express";
import { validateLoginRequest, validateRegisterRequest } from "./validator";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
import { SECRET } from "@config/app/index";
import User, { UserType } from "@models/User";
import Session from "@models/Session";
import Student from "@models/Student";
import Teacher from "@models/Teacher";

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

type RegisterData = BaseRegisterData | StudentRegisterData | TeacherRegisterData;

function isStudent(data: RegisterData): data is StudentRegisterData {
    return data.role === "student" && "studentData" in data;
}

function isTeacher(data: RegisterData): data is TeacherRegisterData {
    return data.role === "teacher" && "teacherData" in data;
}

export const register = httpMethod(async (req: Request, res: Response): Promise<void> => {
    const reqData = await validateRegisterRequest(req) as RegisterData;
    const existingUser = await User.findOne({ email: reqData.email });
    if (existingUser) {
        throw new HttpError(400, "Email Already Exists!");
    }

    // Parse name into first and last name
    const nameParts = reqData.name ? reqData.name.trim().split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const hashedPassword = await bcrypt.hash(reqData.password, 10);
    
    try {
        // Create user first
        const user = await User.create({ 
            ...reqData, 
            password: hashedPassword, 
            role: reqData.role,
            name: {
                first: firstName,
                last: lastName
            }
        });

        // Role-specific creation
        if (isStudent(reqData)) {
            await Student.create({
                userId: user._id,
                ...reqData.studentData,
            });
        } else if (isTeacher(reqData)) {
            // Create teacher with all required fields
            await Teacher.create({
                userId: user._id,
                department: reqData.teacherData.department,
                mobile: reqData.teacherData.mobile,
                address: reqData.teacherData.address,
                status: reqData.teacherData.status || "active",
                joiningDate: reqData.teacherData.joiningDate,
                gender: reqData.teacherData.gender,
                degree: reqData.teacherData.degree,
                section: reqData.teacherData.section,
                type: "teacher"
            });
        }

        res.status(201).json({ 
            user: { 
                name: user.name,
                email: user.email 
            }, 
            message: "Signed Up Successfully !" 
        });
    } catch (error: any) {
        // If anything fails, we should clean up the created user
        if (error.code === 11000) {
            throw new HttpError(400, "A teacher with this information already exists");
        }
        throw new HttpError(500, "Error creating user: " + error.message);
    }
});

export const login = httpMethod(async (req: Request, res: Response) => {
    const reqData = await validateLoginRequest(req);
    const existingUser = await User.findOne({ email: reqData.email });

    if (!existingUser) {
        throw new HttpError(400, "User not Found!");
    }
    const matchPassword = await bcrypt.compare(reqData.password, existingUser.password)

    if (!matchPassword) {
        throw new HttpError(400, "Invalid Credentials !");
    }

    const user = {
        _id: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role,
    };
    const session = await createSession(existingUser)
    res.status(200).json({ user: { ...user || {} }, token: session.accessToken, expiresAt: session.expiresAt, message: "Successfully LoggedIn!" })
})

export const changePassword = httpMethod(async (req: Request, res: Response) => {

    const { email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOneAndUpdate({ email: email }, {
        $set: {
            password: hashedPassword
        },
    }, { new: true });

    if (!existingUser) {
        throw new HttpError(400, "User not Found!");
    }
    res.status(200).json({ user: existingUser, message: "Password Changed Successfully!" })
})

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
        expiresAt: expiresAt
    }).save();
    const token = jwt.sign({ email: user.email, userId: user._id, sessionId: newSession._id }, SECRET);
    newSession.accessToken = token;
    return newSession.save()
}