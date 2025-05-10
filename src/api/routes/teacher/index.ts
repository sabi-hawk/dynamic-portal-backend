import { Router } from "express";
import * as teacherController from "@controllers/teacher";

const teacherRouter = Router();

teacherRouter.post("/add", teacherController.addTeacher);
teacherRouter.get("/", teacherController.getTeachers);
teacherRouter.put("/:id", teacherController.updateTeacher);
teacherRouter.delete("/:id", teacherController.deleteTeacher);

export default teacherRouter;
