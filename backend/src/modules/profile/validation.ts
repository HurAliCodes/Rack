import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),

    gender: z.string().max(50).optional(),

    height: z.number().positive().max(300).optional(),

    weight: z.number().positive().max(500).optional(),

    preferredStyles: z
      .array(z.string().min(1).max(50))
      .max(20)
      .optional(),

    favoriteColors: z
      .array(z.string().min(1).max(50))
      .max(20)
      .optional(),

    topSize: z.string().max(20).optional(),

    bottomSize: z.string().max(20).optional(),

    shoeSize: z.string().max(20).optional(),

    theme: z.enum(["light", "dark"]).optional(),

    notificationsEnabled: z.boolean().optional(),
  }),
});