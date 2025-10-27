import { Router } from "express";
import { UserModel } from "../models/mysql/user.js";
import { UsersController } from "../controllers/users.js";
import { authMiddleware } from "../middlewares/auth.js";

export const userRouter = Router();
const usersController = new UsersController({ userModel: UserModel });

// Public routes
userRouter.post("/register", usersController.register)
userRouter.post("/login", usersController.login)
userRouter.post("/logout", usersController.logout)
userRouter.get('/protected', authMiddleware, usersController.protectedAccess)

// Protected routes
userRouter.get('/balance', authMiddleware, usersController.getBalance)
userRouter.post('/balance', authMiddleware, usersController.addBalance)
