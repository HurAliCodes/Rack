-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "bottomSize" TEXT,
ADD COLUMN     "favoriteColors" TEXT[],
ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "preferredStyles" TEXT[],
ADD COLUMN     "shoeSize" TEXT,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light',
ADD COLUMN     "topSize" TEXT;
