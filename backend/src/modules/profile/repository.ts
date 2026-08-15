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

export const updateAvatar = (
  userId: string,
  avatarUrl: string,
  avatarPublicId: string,
) => {
  return prisma.profile.update({
    where: {
      userId,
    },
    data: {
      avatarUrl,
      avatarPublicId,
    },
  });
};

export const removeAvatar = (
  userId: string,
) => {
  return prisma.profile.update({
    where: {
      userId,
    },
    data: {
      avatarUrl: null,
      avatarPublicId: null,
    },
  });
};