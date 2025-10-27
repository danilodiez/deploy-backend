import { Router } from "express";
import { ItemsController } from "../controllers/items.js";
import { ItemModel } from "../models/mysql/item.js";
import { authMiddleware } from "../middlewares/auth.js";

export const itemsRouter = Router();
const itemsController = new ItemsController({ itemModel: ItemModel });

itemsRouter.get("/", itemsController.getAll)
itemsRouter.get("/by-id/:id", itemsController.getById)
itemsRouter.get("/:name", itemsController.getByName)
itemsRouter.post("/", itemsController.create)
itemsRouter.patch("/:id", itemsController.update)
itemsRouter.delete("/:id", itemsController.delete)
