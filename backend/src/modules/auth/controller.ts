import { NextFunction, Request, Response } from "express";

import * as authService from "./service";
import { successResponse } from "../../shared/utils/apiResponse";
import { AuthRequest } from "../../shared/middleware/auth";
import { AppError } from "@/shared/errors/AppError";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.register(req.body);

    return successResponse(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.login(req.body);

    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refresh(refreshToken);

    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    await authService.logout(refreshToken);

    return successResponse(res, null);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, password } = req.body;

    await authService.resetPassword(token, password);
    
    return successResponse(res, {
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
}; 

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    await authService.requestPasswordReset(email);

    return successResponse(res, {
      message:
        "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.body;

    await authService.verifyEmail(token);

    return successResponse(res, {
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};


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

    const user = await authService.getCurrentUser(req.user.id);

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

// export const forgotPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const { email } = req.body;

//     const token =
//       await authService.requestPasswordReset(email);

//     return successResponse(res, {
//       message:
//         "If an account exists with that email, a password reset link has been sent.",
//       ...(process.env.NODE_ENV === "development" && token
//         ? { developmentToken: token }
//         : {}),
//     });
//   } catch (error) {
//     next(error);
//   }
// };