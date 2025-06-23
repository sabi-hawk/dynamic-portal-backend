import { Router, Request, Response, NextFunction } from "express";
import * as authController from "../../controllers/auth";
import { authenticateJwt } from "../../middlewares/auth";

const authRouter = Router();

const conditionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.body;
  if (role === 'student' || role === 'teacher') {
    return authenticateJwt(req, res, next);
  }
  next();
};

authRouter.post("/register", conditionalAuth, authController.register)
authRouter.post("/login", authController.login)
authRouter.post("/changePassword", authController.changePassword)
// authRouter.post("/logout", authController.logout)
// authRouter.post("/refresh_token", authController.refreshToken)

export default authRouter