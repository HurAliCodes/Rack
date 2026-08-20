import { NextFunction, Response } from "express";

import { AuthRequest } from "../../shared/middleware/auth";
import { successResponse } from "../../shared/utils/apiResponse";

import * as clothingImageService from "./service";

export const uploadClothingImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new Error("Image file is required");
    }

    const image =
      await clothingImageService.uploadClothingImage(
        req.user!.id,
        req.params.id,
        req.file,
      );

    return successResponse(
      res,
      image,
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const getClothingImages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const images =
      await clothingImageService.getClothingImages(
        req.user!.id,
        req.params.id,
      );

    return successResponse(
      res,
      images,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteClothingImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result =
    await clothingImageService.removeClothingImage(
      req.user!.id,
      req.params.id,
    );

    return successResponse(res, result);

  } catch (error) {
    next(error);
  }
};

export const setCoverImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const image =
      await clothingImageService.makeCoverImage(
        req.user!.id,
        req.params.id,
      );

    return successResponse(
      res,
      image,
    );
  } catch (error) {
    next(error);
  }
};