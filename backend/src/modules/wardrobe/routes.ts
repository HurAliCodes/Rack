import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth";
import { validate } from "../../shared/middleware/validate";
import * as controller from "./controller";
import {
  createClothingItemSchema,
  getClothingItemsSchema,
  updateClothingItemSchema,
} from "./validation";

const router = Router();

router.use(authenticate);

router
  .post("/items", validate(createClothingItemSchema), controller.createClothingItem)
  .get( "/items", validate(getClothingItemsSchema), controller.getAllClothingItems)
  .get("/items/:id", controller.getClothingItem)
  .patch("/items/:id", validate(updateClothingItemSchema), controller.updateClothingItem)
  .delete("/items/:id", controller.deleteClothingItem);

export default router;