// routes/studentRouter.ts
import express from "express";
import * as studentController from "@controllers/student";
import * as submissionController from "@controllers/submission";
import { authenticateJwt } from "@middlewares/auth";
import { uploadSubmission } from "@middlewares/fileUploader";

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
studentRouter.get("/courses", studentController.getStudentCourses);

// Submission routes
studentRouter.get("/submissions", submissionController.listStudentSubmissions);
studentRouter.post(
  "/submission/:id/upload",
  uploadSubmission.single("file"),
  submissionController.uploadStudentSubmission
);
studentRouter.get(
  "/submission/:id/upload",
  submissionController.getOwnSubmissionUpload
);

// Course materials for a specific course and the student's section
studentRouter.get("/materials", studentController.getStudentCourseMaterials);

export default studentRouter;
