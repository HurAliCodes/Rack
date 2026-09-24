import { ClothingCategory, ClothingSeason, ClothingStatus } from "@prisma/client";

export interface CreateClothingItemInput {
  name?: string;
  category?: ClothingCategory; 
  brand?: string;
  color?: string;
  season?: ClothingSeason; 
  size?: string;
  notes?: string;
  favorite?: boolean;
  status?: ClothingStatus; 
}

export interface UpdateClothingItemInput {
  name?: string;
  category?: ClothingCategory; 
  brand?: string;
  color?: string;
  season?: ClothingSeason; 
  size?: string;
  notes?: string;
  favorite?: boolean;
  status?: ClothingStatus; 
  lastWornAt?: Date;
}

export interface GetClothingItemsQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  color?: string;
  season?: string;
  favorite?: boolean;
  status?: string;
  size?: string;
  sort?: ClothingSort;
}

export type ClothingSort =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "recently_worn";