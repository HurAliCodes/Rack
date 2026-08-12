import { prisma } from "../../infrastructure/database/prisma";

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
    },
  });
};

export const createUser = (data: {
  email: string;
  passwordHash: string;
  name?: string;
}) => {
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      profile: {
        create: {
          name: data.name,
        },
      },
    },
    include: {
      profile: true,
    },
  });
};

export const createRefreshToken = (data: {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}) => {
  return prisma.refreshToken.create({
    data: {
      tokenHash: data.tokenHash,
      userId: data.userId,
      expiresAt: data.expiresAt,
    },
  });
};

export const findRefreshToken = (tokenHash: string) => {
  return prisma.refreshToken.findFirst({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });
};

export const revokeRefreshToken = (id: string) => {
  return prisma.refreshToken.update({
    where: {
      id,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};