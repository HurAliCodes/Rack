import { NextFunction, Response } from "express";

import { AuthRequest } from "../../shared/middleware/auth";
import { successResponse } from "../../shared/utils/apiResponse";
import * as profileService from "./service";

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const profile = await profileService.getProfile(userId);

    return successResponse(res, profile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const profile = await profileService.updateProfile(
      userId,
      req.body,
    );

    return successResponse(res, profile);
  } catch (error) {
    next(error);
  }
};