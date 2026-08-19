export interface CreateClothingImageInput {
  clothingItemId: string;
}

export interface ClothingImageResponse {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  isCover: boolean;
  clothingItemId: string;
  createdAt: Date;
}