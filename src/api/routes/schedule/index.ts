import { Router } from "express";
import * as scheduleController from "@controllers/schedule";
import { authenticateJwt } from "@middlewares/auth";

const scheduleRouter = Router();

scheduleRouter.use(authenticateJwt);
// Get schedule detail
scheduleRouter.get("/:id", scheduleController.getScheduleDetail);

export default scheduleRouter;
