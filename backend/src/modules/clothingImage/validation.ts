import { z } from "zod";

export const clothingItemIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const imageIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});