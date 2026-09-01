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
export const findAllClothingItems = async (
  userId: string,
  page: number,
  limit: number,
  search?: string,
  category?: string,
  color?: string,
  season?: string,
  favorite?: boolean,
  status?: string,
  size?: string,
) => {
  const skip = (page - 1) * limit;
  const where = {
      userId,

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                brand: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),

      ...(category ? { category: category as any } : {}),

      ...(color
        ? {
            color: {
              equals: color,
              mode: "insensitive" as const,
            },
          }
        : {}),

      ...(season ? { season: season as any } : {}),

      ...(favorite !== undefined
        ? { favorite }
        : {}),

      ...(status ? { status: status as any } : {}),

      ...(size
        ? {
            size: {
              equals: size,
              mode: "insensitive" as const,
            },
          }
        : {}),
    };

  const [items, total] = await Promise.all([
    prisma.clothingItem.findMany({
      where: {
        where
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
      where
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