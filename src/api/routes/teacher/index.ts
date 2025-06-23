import { Router } from "express";
import * as teacherController from "@controllers/teacher";
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

export default teacherRouter;
