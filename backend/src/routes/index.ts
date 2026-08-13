import { Router } from "express";
import { authRoutes } from "../modules/auth";
import { profileRoutes } from "../modules/profile";
import healthRoute from "./health.route";

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use("/health", healthRoute);

export default router;