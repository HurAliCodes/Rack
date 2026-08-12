import { Router } from "express";

import { authenticate } from "../../shared/middleware/auth";

import * as controller from "./controller";

import { validate } from "../../shared/middleware/validate";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
   verifyEmailSchema,
} from "./validation";

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

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  controller.forgotPassword,
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  controller.resetPassword,
);

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  controller.verifyEmail,
);

router.get(
  "/me",
  authenticate,
  controller.getMe,
);

export default router;