import { Router } from "express";
import * as courseController from "@controllers/course";

const courseRouter = Router();

courseRouter.post("/add", courseController.addCourse);
courseRouter.get("/", courseController.getCourses);
courseRouter.get("/:id", courseController.getCourseById);
courseRouter.put("/:id", courseController.updateCourse);
courseRouter.delete("/:id", courseController.deleteCourse);
courseRouter.get(
  "/instructor/:instructorId",
  courseController.getCoursesByInstructor
);
courseRouter.get("/:courseId/schedules", courseController.getCourseSchedules);

export default courseRouter;
