export interface UpdateProfileInput {
  name?: string;
  gender?: string;
  height?: number;
  weight?: number;
  preferredStyles?: string[];
  favoriteColors?: string[];
  topSize?: string;
  bottomSize?: string;
  shoeSize?: string;
  theme?: string;
  notificationsEnabled?: boolean;
}

export interface ProfileResponse {
  id: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  preferredStyles: string[];
  favoriteColors: string[];
  topSize: string | null;
  bottomSize: string | null;
  shoeSize: string | null;
  theme: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}