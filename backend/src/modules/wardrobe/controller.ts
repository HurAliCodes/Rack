import { NextFunction, Response } from "express";

import { AuthRequest } from "../../shared/middleware/auth";
import { successResponse } from "../../shared/utils/apiResponse";

import * as wardrobeService from "./service";

export const createClothingItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item =
      await wardrobeService.createClothingItem(
        req.user!.id,
        req.body,
      );

    return successResponse(
      res,
      item,
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const getAllClothingItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const result =
      await wardrobeService.getAllClothingItems(
        req.user!.id,
        page,
        limit,
      );

    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getClothingItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item =
      await wardrobeService.getClothingItem(
        req.params.id,
        req.user!.id,
      );

    return successResponse(
      res,
      item,
    );
  } catch (error) {
    next(error);
  }
};

export const updateClothingItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item =
      await wardrobeService.updateClothingItem(
        req.params.id,
        req.user!.id,
        req.body,
      );

    return successResponse(
      res,
      item,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteClothingItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await wardrobeService.deleteClothingItem(
      req.params.id,
      req.user!.id,
    );

    return successResponse(
      res,
      {
        message:
          "Clothing item deleted successfully",
      },
    );
  } catch (error) {
    next(error);
  }
};