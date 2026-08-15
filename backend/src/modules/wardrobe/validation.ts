import { z } from "zod";
import { ClothingCategory, ClothingSeason, ClothingStatus } from "@prisma/client";

const clothingCategoryEnum = z.enum(Object.values(ClothingCategory) as [string, ...string[]]);
const clothingSeasonEnum = z.enum(Object.values(ClothingSeason) as [string, ...string[]]);
const clothingStatusEnum = z.enum(Object.values(ClothingStatus) as [string, ...string[]]);

export const createClothingItemSchema = z.object({
  body: z.object({
    name: z.string().max(100).optional(),
    category: clothingCategoryEnum.optional(), 
    brand: z.string().max(100).optional(),
    color: z.string().max(50).optional(),
    season: clothingSeasonEnum.optional(), 
    size: z.string().max(50).optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const updateClothingItemSchema = z.object({
  body: z.object({
    name: z.string().max(100).optional(),
    category: clothingCategoryEnum.optional(),
    brand: z.string().max(100).optional(),
    color: z.string().max(50).optional(),
    season: clothingSeasonEnum.optional(),
    size: z.string().max(50).optional(),
    notes: z.string().max(1000).optional(),
    favorite: z.boolean().optional(),
    status: clothingStatusEnum.optional(),
    lastWornAt: z.coerce.date().optional(),
  }),
});

export const paramsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});