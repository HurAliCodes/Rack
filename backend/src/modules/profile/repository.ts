import { prisma } from "../../infrastructure/database/prisma";
import { UpdateProfileInput } from "./types";

export const findProfileByUserId = (userId: string) => {
  return prisma.profile.findUnique({
    where: {
      userId,
    },
  });
};

export const updateProfile = (
  userId: string,
  data: UpdateProfileInput,
) => {
  return prisma.profile.update({
    where: {
      userId,
    },
    data,
  });
};