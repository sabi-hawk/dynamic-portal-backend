import { Router } from "express";
import * as sectionController from "@controllers/section";
import { authenticateJwt } from "@middlewares/auth";

const sectionRouter = Router();

// Secure all section routes
sectionRouter.use(authenticateJwt);

sectionRouter.post("/add", sectionController.addSection);
sectionRouter.get("/", sectionController.getSections);
sectionRouter.get("/:id", sectionController.getSectionById);
sectionRouter.put("/:id", sectionController.updateSection);
sectionRouter.delete("/:id", sectionController.deleteSection);
sectionRouter.get("/:id/statistics", sectionController.getSectionStatistics);
sectionRouter.get("/:id/students", sectionController.getSectionStudents);

export default sectionRouter;
