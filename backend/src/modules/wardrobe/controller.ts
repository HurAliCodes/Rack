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

    const search = req.query.search
      ? String(req.query.search)
      : undefined;

    const category = req.query.category
      ? String(req.query.category)
      : undefined;

    const color = req.query.color
      ? String(req.query.color)
      : undefined;

    const season = req.query.season
      ? String(req.query.season)
      : undefined;

    const favorite =
      req.query.favorite !== undefined
        ? Boolean(req.query.favorite)
        : undefined;

    const status = req.query.status
      ? String(req.query.status)
      : undefined;

    const size = req.query.size
      ? String(req.query.size)
      : undefined;

    const sort = req.query.sort
      ? String(req.query.sort)
      : "newest";

    const result =
      await wardrobeService.getAllClothingItems(
        req.user!.id,
        page,
        limit,
        search,
        category,
        color,
        season,
        favorite,
        status,
        size,
        sort
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

export const toggleFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item =
      await wardrobeService.toggleFavorite(
        req.user!.id,
        req.params.id,
      );

    return successResponse(res, item);
  } catch (error) {
    next(error);
  }
};

export const archiveClothingItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item =
      await wardrobeService.archiveClothingItem(
        req.user!.id,
        req.params.id,
      );

    return successResponse(res, item);
  } catch (error) {
    next(error);
  }
};

export const restoreClothingItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item =
      await wardrobeService.restoreClothingItem(
        req.user!.id,
        req.params.id,
      );

    return successResponse(res, item);
  } catch (error) {
    next(error);
  }
};