import { AppError } from "../../shared/errors/AppError";

import {
  deleteImage as deleteCloudinaryImage,
  uploadImage,
} from "../../infrastructure/storage/cloudinary";

import * as repository from "./repository";

export const uploadClothingImage = async (
  userId: string,
  clothingItemId: string,
  file: Express.Multer.File,
) => {
  const clothingItem =
    await repository.findClothingItem(
      clothingItemId,
      userId,
    );

  if (!clothingItem) {
    throw new AppError(
      "Clothing item not found",
      404,
      "CLOTHING_ITEM_NOT_FOUND",
    );
  }

  const uploadedImage =
    await uploadImage(
      file.buffer,
      "clothing",
    );

  const existingImages =
    await repository.findImagesByClothingItemId(
      clothingItemId,
    );

  return repository.createImage({
    imageUrl: uploadedImage.url,
    imagePublicId:
      uploadedImage.publicId,
    clothingItemId,
    isCover:
      existingImages.length === 0,
  });
};

export const getClothingImages =
  async (
    userId: string,
    clothingItemId: string,
  ) => {
    const clothingItem =
      await repository.findClothingItem(
        clothingItemId,
        userId,
      );

    if (!clothingItem) {
      throw new AppError(
        "Clothing item not found",
        404,
        "CLOTHING_ITEM_NOT_FOUND",
      );
    }

    return repository.findImagesByClothingItemId(
      clothingItemId,
    );
  };

export const removeClothingImage =
  async (
    userId: string,
    imageId: string,
  ) => {
    const image =
      await repository.findImageById(
        imageId,
      );

    if (!image) {
      throw new AppError(
        "Image not found",
        404,
        "IMAGE_NOT_FOUND",
      );
    }

    const clothingItem =
      await repository.findClothingItem(
        image.clothingItemId,
        userId,
      );

    if (!clothingItem) {
      throw new AppError(
        "Image not found",
        404,
        "IMAGE_NOT_FOUND",
      );
    }

    await deleteCloudinaryImage(
      image.imagePublicId,
    );

    return repository.deleteImage(
      imageId,
    );
  };

export const makeCoverImage =
  async (
    userId: string,
    imageId: string,
  ) => {
    const image =
      await repository.findImageById(
        imageId,
      );

    if (!image) {
      throw new AppError(
        "Image not found",
        404,
        "IMAGE_NOT_FOUND",
      );
    }

    const clothingItem =
      await repository.findClothingItem(
        image.clothingItemId,
        userId,
      );

    if (!clothingItem) {
      throw new AppError(
        "Image not found",
        404,
        "IMAGE_NOT_FOUND",
      );
    }

    await repository.clearCoverImages(
      image.clothingItemId,
    );

    return repository.setCoverImage(
      imageId,
    );
  };