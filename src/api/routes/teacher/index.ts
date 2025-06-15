import { Router } from "express";
import * as teacherController from "@controllers/teacher";

const teacherRouter = Router();

teacherRouter.post("/add", teacherController.addTeacher);
teacherRouter.get("/", teacherController.getTeachers);
teacherRouter.put("/:id", teacherController.updateTeacher);
teacherRouter.delete("/:id", teacherController.deleteTeacher);
teacherRouter.get("/user/:userId", teacherController.getTeacherByUserId);
teacherRouter.get(
  "/:teacherId/courses",
  teacherController.getTeacherCoursesAndSchedules
);
teacherRouter.get(
  "/:teacherId/today",
  teacherController.getTeacherTodaySchedules
);

export default teacherRouter;
