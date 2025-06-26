import { Router } from "express";
import * as teacherController from "@controllers/teacher";
import * as submissionController from "@controllers/submission";
import * as attendanceController from "@controllers/attendance";
import { authenticateJwt } from "@middlewares/auth";

const teacherRouter = Router();

// Secure all teacher routes
teacherRouter.use(authenticateJwt);

teacherRouter.post("/add", teacherController.addTeacher);
teacherRouter.get("/", teacherController.getTeachers);
teacherRouter.put("/:id", teacherController.updateTeacher);
teacherRouter.delete("/:id", teacherController.deleteTeacher);
teacherRouter.get("/profile", teacherController.getTeacherByUserId);
teacherRouter.get("/courses", teacherController.getTeacherCoursesAndSchedules);
teacherRouter.get("/today", teacherController.getTeacherTodaySchedules);

// Submission endpoints
teacherRouter.post("/submission", submissionController.createSubmission);
teacherRouter.get("/submissions", submissionController.listTeacherSubmissions);
teacherRouter.get(
  "/submission/:id/uploads",
  submissionController.getSubmissionUploads
);

teacherRouter.post("/attendance", attendanceController.markAttendance);
teacherRouter.get("/attendance", attendanceController.getAttendanceForSchedule);
teacherRouter.get(
  "/attendance/students",
  attendanceController.getStudentsForSchedule
);

export default teacherRouter;
