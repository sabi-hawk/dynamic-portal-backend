import { Router } from "express";
import authRouter from "./auth";
import teacherRouter from "./teacher";
import studentRouter from "./student";
import courseRouter from "./course";
import settingsRouter from "./settings";
import scheduleRouter from "./schedule";
import materialRouter from "./courseMaterial";
// import userRouter from "./user";
// import mediaRouter from "./media";
// import aboutRouter from "./about";
// import conversationRouter from "./conversation";
// import notificationRouter from "./notification";
// import storyRouter from "./story";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/teacher", teacherRouter);
apiRouter.use("/student", studentRouter);
apiRouter.use("/course", courseRouter);
apiRouter.use("/course-material", materialRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/schedule", scheduleRouter);
// apiRouter.use("/about", aboutRouter);
// apiRouter.use("/conversation", conversationRouter);
// apiRouter.use("/media", mediaRouter);
// apiRouter.use("/notification", notificationRouter);
// apiRouter.use("/story", storyRouter);
// apiRouter.use("/user", userRouter);

export default apiRouter;
