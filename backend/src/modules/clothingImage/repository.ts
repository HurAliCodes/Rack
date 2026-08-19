import { prisma } from "../../infrastructure/database/prisma";

export const createImage = (data: {
  imageUrl: string;
  imagePublicId: string;
  clothingItemId: string;
  isCover?: boolean;
}) => {
  return prisma.clothingImage.create({
    data,
  });
};

export const findImagesByClothingItemId = (
  clothingItemId: string,
) => {
  return prisma.clothingImage.findMany({
    where: {
      clothingItemId,
    },

    orderBy: {
      createdAt: "asc",
    },
  });
};

export const findImageById = (
  id: string,
) => {
  return prisma.clothingImage.findUnique({
    where: {
      id,
    },
  });
};

export const deleteImage = (
  id: string,
) => {
  return prisma.clothingImage.delete({
    where: {
      id,
    },
  });
};

export const clearCoverImages = (
  clothingItemId: string,
) => {
  return prisma.clothingImage.updateMany({
    where: {
      clothingItemId,
    },

    data: {
      isCover: false,
    },
  });
};

export const setCoverImage = (
  id: string,
) => {
  return prisma.clothingImage.update({
    where: {
      id,
    },

    data: {
      isCover: true,
    },
  });
};

export const findClothingItem = (
  clothingItemId: string,
  userId: string,
) => {
  return prisma.clothingItem.findFirst({
    where: {
      id: clothingItemId,
      userId,
    },
  });
};