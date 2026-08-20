import { AppError } from "../../shared/errors/AppError";

import * as repository from "./repository";

import {
  CreateClothingItemInput,
  UpdateClothingItemInput,
} from "./types";

export const createClothingItem = async (
  userId: string,
  input: CreateClothingItemInput,
) => {
  return repository.createClothingItem(
    userId,
    input,
  );
};

export const getAllClothingItems = async (
  userId: string,
  page: number,
  limit: number,
) => {
  return repository.findAllClothingItems(
    userId,
    page,
    limit,
  );
};

export const getClothingItem = async (
  id: string,
  userId: string,
) => {
  const item =
    await repository.findClothingItemById(
      id,
      userId,
    );

  if (!item) {
    throw new AppError(
      "Clothing item not found",
      404,
      "CLOTHING_ITEM_NOT_FOUND",
    );
  }

  return item;
};

export const updateClothingItem = async (
  id: string,
  userId: string,
  input: UpdateClothingItemInput,
) => {
  await getClothingItem(
    id,
    userId,
  );

  return repository.updateClothingItem(
    id,
    input,
  );
};

export const deleteClothingItem = async (
  id: string,
  userId: string,
) => {
  await getClothingItem(
    id,
    userId,
  );

  return repository.deleteClothingItem(
    id,
  );
};