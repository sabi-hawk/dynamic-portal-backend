import { Router } from "express";
import * as scheduleController from "@controllers/schedule";

const scheduleRouter = Router();

// Get schedule detail
scheduleRouter.get("/:id", scheduleController.getScheduleDetail);

export default scheduleRouter;
