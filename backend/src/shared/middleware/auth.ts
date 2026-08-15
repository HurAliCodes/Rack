import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../../config/env";
import { AppError } from "../errors/AppError";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
  params: {
    id: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError(
        "Authentication required",
        401,
        "UNAUTHORIZED",
      );
    }

    const token = header.substring(7);

    const payload = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as {
      sub: string;
      role: string;
    };

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(
      new AppError(
        "Invalid or expired access token",
        401,
        "INVALID_ACCESS_TOKEN",
      ),
    );
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (
    req: AuthRequest,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return next(
        new AppError(
          "Authentication required",
          401,
          "UNAUTHORIZED",
        ),
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to access this resource",
          403,
          "FORBIDDEN",
        ),
      );
    }

    next();
  };
};