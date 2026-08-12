import { PrismaClient } from "@prisma/client";
import logger from "../logger/logger";

export const prisma = new PrismaClient();

export const connectDatabase = async () => {
  await prisma.$connect();
  logger.info("Database connected");
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};