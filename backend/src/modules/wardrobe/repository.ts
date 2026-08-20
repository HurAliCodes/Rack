import { prisma } from "../../infrastructure/database/prisma";

import {
  CreateClothingItemInput,
  UpdateClothingItemInput,
} from "./types";

export const createClothingItem = (
  userId: string,
  data: CreateClothingItemInput,
) => {
  return prisma.clothingItem.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const findAllClothingItems = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.clothingItem.findMany({
      where: {
        userId,
      },
      include: {
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.clothingItem.count({
      where: {
        userId,
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const findClothingItemById = (
  id: string,
  userId: string,
) => {
  return prisma.clothingItem.findFirst({
    where: {
      id,
      userId,
    },

    include: {
      images: true,
    },
  });
};

export const updateClothingItem = (
  id: string,
  data: UpdateClothingItemInput,
) => {
  return prisma.clothingItem.update({
    where: {
      id,
    },

    data,
  });
};

export const deleteClothingItem = (
  id: string,
) => {
  return prisma.clothingItem.delete({
    where: {
      id,
    },
  });
};