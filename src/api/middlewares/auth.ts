import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "@config/app/index";
import Session from "@models/Session";
import User from "@models/User";
import Teacher from "@models/Teacher";
import Student from "@models/Student";

// Extend the Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        sessionId: string;
      };
    }
  }
}

export const authenticateJwt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Authentication token required" });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, SECRET) as {
      email: string;
      userId: string;
      sessionId: string;
    };

    // Check if session exists and is not expired
    Session.findById(decoded.sessionId)
      .then(async (session) => {
        if (!session || (session.expiresAt && session.expiresAt < new Date())) {
          res.status(401).json({ message: "Session expired" });
          return;
        }

        // Get user details to check role
        const user = await User.findById(decoded.userId);
        if (!user) {
          res.status(401).json({ message: "User not found" });
          return;
        }

        let finalUserId = decoded.userId;

        // If user is a teacher or student, get their respective document ID
        if (user.role === "teacher") {
          const teacher = await Teacher.findOne({ userId: decoded.userId });
          if (teacher) {
            finalUserId = (teacher as any)._id.toString();
          }
        } else if (user.role === "student") {
          const student = await Student.findOne({ userId: decoded.userId });
          if (student) {
            finalUserId = (student as any)._id.toString();
          }
        }

        // Add user info to request
        req.user = {
          id: finalUserId,
          email: decoded.email,
          sessionId: decoded.sessionId,
        };

        next();
      })
      .catch((error) => {
        res.status(401).json({
          message: "Invalid session",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });
  } catch (error) {
    res.status(401).json({
      message: "Invalid authentication token",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
