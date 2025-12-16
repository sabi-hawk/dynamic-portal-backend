import { Router } from "express";
import * as classController from "@controllers/class";
import { authenticateJwt } from "@middlewares/auth";

const classRouter = Router();

// Secure all class routes
classRouter.use(authenticateJwt);

classRouter.post("/add", classController.addClass);
classRouter.get("/", classController.getClasses);
classRouter.get("/:id", classController.getClassById);
classRouter.put("/:id", classController.updateClass);
classRouter.delete("/:id", classController.deleteClass);
classRouter.get("/:classId/sections", classController.getClassSections);
classRouter.get("/:id/statistics", classController.getClassStatistics);

export default classRouter;
