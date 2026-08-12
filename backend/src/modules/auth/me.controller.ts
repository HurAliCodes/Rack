import { NextFunction, Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth";
import { findUserById } from "./repository";
import { AppError } from "../../shared/errors/AppError";
import { successResponse } from "../../shared/utils/apiResponse";

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError(
        "Authentication required",
        401,
        "UNAUTHORIZED",
      );
    }

    const user = await findUserById(req.user.id);

    if (!user) {
      throw new AppError(
        "User not found",
        404,
        "USER_NOT_FOUND",
      );
    }

    return successResponse(res, {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profile: user.profile,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};