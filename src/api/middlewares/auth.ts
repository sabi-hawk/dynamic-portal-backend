import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "@config/app/index";
import Session from "@models/Session";

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
      .then((session) => {
        if (!session || (session.expiresAt && session.expiresAt < new Date())) {
          res.status(401).json({ message: "Session expired" });
          return;
        }

        // Add user info to request
        req.user = {
          id: decoded.userId,
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
