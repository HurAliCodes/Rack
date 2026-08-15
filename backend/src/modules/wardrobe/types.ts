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