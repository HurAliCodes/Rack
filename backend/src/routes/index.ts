import { Router } from "express";
import { authRoutes } from "../modules/auth";
import healthRoute from "./health.route";

const router = Router();

router.use('/auth', authRoutes);
router.use("/health", healthRoute);

export default router;