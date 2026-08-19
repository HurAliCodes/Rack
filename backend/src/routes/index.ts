import { Router } from "express";
import { authRoutes } from "../modules/auth";
import { profileRoutes } from "../modules/profile";
import { wardrobeRoutes } from "../modules/wardrobe";
import { clothingImageRoutes } from "../modules/clothingImage";
import healthRoute from "./health.route";

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use("/health", healthRoute);
router.use("/wardrobe", wardrobeRoutes);
router.use("/clothing-images", clothingImageRoutes);

export default router;