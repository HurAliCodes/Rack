import { Router } from "express";

import { authenticate } from "../../shared/middleware/auth";
import { upload } from "../../shared/middleware/upload";
import { validate } from "../../shared/middleware/validate";

import {
  deleteClothingImage,
  getClothingImages,
  setCoverImage,
  uploadClothingImage,
} from "./controller";

import {
  clothingItemIdSchema,
  imageIdSchema,
} from "./validation";

const router = Router();

router.use(authenticate);

router.post(
  "/items/:id/images",
  validate(clothingItemIdSchema),
  upload.single("image"),
  uploadClothingImage,
);

router.get(
  "/items/:id/images",
  validate(clothingItemIdSchema),
  getClothingImages,
);

router.delete(
  "/images/:id",
  validate(imageIdSchema),
  deleteClothingImage,
);

router.patch(
  "/images/:id/cover",
  validate(imageIdSchema),
  setCoverImage,
);

export default router;