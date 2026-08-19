-- CreateTable
CREATE TABLE "ClothingImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "clothingItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClothingImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClothingImage" ADD CONSTRAINT "ClothingImage_clothingItemId_fkey" FOREIGN KEY ("clothingItemId") REFERENCES "ClothingItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
