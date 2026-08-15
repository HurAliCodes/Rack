import { Router } from "express";

import { authenticate } from "../../shared/middleware/auth";
import { validate } from "../../shared/middleware/validate";
import { upload } from "../../shared/middleware/upload";
import {
  deleteAvatar,
  getProfile,
  updateAvatar,
  updateProfile,
} from "./controller";

import { updateProfileSchema } from "./validation";

const router = Router();

router.use(authenticate);

router.get("/", getProfile);

router.patch("/", validate(updateProfileSchema), updateProfile);

router.patch("/avatar", upload.single("avatar"), updateAvatar );

router.delete( "/avatar", deleteAvatar);

export default router;