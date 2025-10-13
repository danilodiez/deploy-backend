import { Router } from "express";
import { UserModel } from "../models/mysql/user.js";
import { UsersController } from "../controllers/users.js";

export const userRouter = Router();
const usersController = new UsersController({ userModel: UserModel });

userRouter.post("/register", usersController.register)
userRouter.post("/login", usersController.login)
userRouter.post("/logout", usersController.logout)


userRouter.get('/protected', usersController.protectedAccess)
