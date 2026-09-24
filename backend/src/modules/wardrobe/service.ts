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
  search?: string,
  category?: string,
  color?: string,
  season?: string,
  favorite?: boolean,
  status?: string,
  size?: string,
  sort: string = "newest",
) => {
  return repository.findAllClothingItems(
    userId,
    page,
    limit,
    search,
    category,
    color,
    season,
    favorite,
    status,
    size,
    sort
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

export const toggleFavorite = async (
  userId: string,
  id: string,
) => {
  const item = await getClothingItem(
    id,
    userId,
  );

  return repository.updateFavorite(
    id,
    !item.favorite,
  );
};

export const archiveClothingItem = async (
  userId: string,
  id: string,
) => {
  await getClothingItem(id, userId);

  return repository.updateStatus(
    id,
    "ARCHIVED",
  );
};

export const restoreClothingItem = async (
  userId: string,
  id: string,
) => {
  await getClothingItem(id, userId);

  return repository.updateStatus(
    id,
    "AVAILABLE",
  );
};