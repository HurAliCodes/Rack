import { Router } from "express";

import { authenticate } from "../../shared/middleware/auth";
import { validate } from "../../shared/middleware/validate";

import {
  getProfile,
  updateProfile,
} from "./controller";

import { updateProfileSchema } from "./validation";

const router = Router();

router.use(authenticate);

router.get("/", getProfile);

router.patch( "/", validate(updateProfileSchema), updateProfile);

export default router;