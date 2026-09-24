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

export const getClothingItemsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),

    search: z.string().trim().min(1).optional(),

    category: z.string().optional(),
    color: z.string().optional(),
    season: z.string().optional(),

    favorite: z
      .enum(["true", "false"])
      .transform((value:any) => value === "true")
      .optional(),

    status: z.string().optional(),
    size: z.string().optional(),
    sort: z
      .enum([
        "newest",
        "oldest",
        "name_asc",
        "name_desc",
        "recently_worn",
      ])
      .default("newest")
  }),
});

