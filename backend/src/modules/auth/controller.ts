import { NextFunction, Request, Response } from "express";

import * as authService from "./service";
import { successResponse } from "../../shared/utils/apiResponse";

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