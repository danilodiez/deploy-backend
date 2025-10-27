import { Router } from "express";
import { PurchaseController } from "../controllers/purchase.js";
import { PurchaseModel } from "../models/mysql/purchase.js";
import { ItemModel } from "../models/mysql/item.js";
import { UserModel } from "../models/mysql/user.js";
import { authMiddleware } from "../middlewares/auth.js";

export const purchaseRouter = Router();
const purchaseController = new PurchaseController({
  purchaseModel: PurchaseModel,
  itemModel: ItemModel,
  userModel: UserModel
});

// All purchase routes require authentication
purchaseRouter.use(authMiddleware);

purchaseRouter.post("/", purchaseController.create);
purchaseRouter.get("/my-purchases", purchaseController.getMyPurchases);
purchaseRouter.get("/all", purchaseController.getAll);
purchaseRouter.get("/:id", purchaseController.getById);


