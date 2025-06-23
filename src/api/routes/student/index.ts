// routes/studentRouter.ts
import express from "express";
import * as studentController from "@controllers/student";
import { authenticateJwt } from "@middlewares/auth";

const studentRouter = express.Router();

// Secure all student routes
studentRouter.use(authenticateJwt);

studentRouter.post("/add", studentController.addStudent);
studentRouter.get("/", studentController.getStudents);
studentRouter.put("/:id", studentController.updateStudent);
studentRouter.delete("/:id", studentController.deleteStudent);

// New routes for student dashboard
studentRouter.get("/profile", studentController.getStudentByUserId);
studentRouter.get("/schedule", studentController.getStudentSchedule);
studentRouter.get("/today", studentController.getStudentTodaySchedules);
studentRouter.get(
  "/today-with-instructor",
  studentController.getStudentTodaySchedulesWithInstructor
);

export default studentRouter;
