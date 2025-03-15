import { Router } from "express";
import authRouter from "./auth";
// import userRouter from "./user";
// import mediaRouter from "./media";
// import aboutRouter from "./about";
// import conversationRouter from "./conversation";
// import notificationRouter from "./notification";
// import storyRouter from "./story";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
// apiRouter.use("/about", aboutRouter);
// apiRouter.use("/conversation", conversationRouter);
// apiRouter.use("/media", mediaRouter);
// apiRouter.use("/notification", notificationRouter);
// apiRouter.use("/story", storyRouter);
// apiRouter.use("/user", userRouter);

export default apiRouter;