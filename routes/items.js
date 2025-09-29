import { Router } from "express";
import { ItemsController } from "../controllers/items.js";

export const itemsRouter = Router();
// TODO
// Obtenemos por ID
itemsRouter.get("/", ItemsController.getAll)
itemsRouter.get("/:name", ItemsController.getByName)
itemsRouter.post("/", ItemsController.create)
itemsRouter.patch("/:id", ItemsController.update)
itemsRouter.delete("/:id", ItemsController.delete)
