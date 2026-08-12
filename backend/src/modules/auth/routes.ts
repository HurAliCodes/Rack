import { Router } from "express";

import * as controller from "./controller";

import { validate } from "../../shared/middleware/validate";
import {
  registerSchema,
  loginSchema,
} from "./validation";

import { getMe } from "./me.controller";
import { authenticate } from "../../shared/middleware/auth";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  controller.register,
);

router.post(
  "/login",
  validate(loginSchema),
  controller.login,
);

router.post(
  "/refresh",
  controller.refresh,
);

router.post(
  "/logout",
  controller.logout,
);

router.get(
  "/me",
  authenticate,
  getMe,
);

export default router;