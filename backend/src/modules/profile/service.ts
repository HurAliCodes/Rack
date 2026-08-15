import { AppError } from "../../shared/errors/AppError";
import * as repository from "./repository";
import { UpdateProfileInput } from "./types";
import { deleteImage, uploadImage } from "../../infrastructure/storage/cloudinary";

export const getProfile = async (userId: string) => {
  const profile = await repository.findProfileByUserId(userId);

  if (!profile) {
    throw new AppError(
      "Profile not found",
      404,
      "PROFILE_NOT_FOUND",
    );
  }

  return profile;
};

export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput,
) => {
  const profile = await repository.findProfileByUserId(userId);

  if (!profile) {
    throw new AppError(
      "Profile not found",
      404,
      "PROFILE_NOT_FOUND",
    );
  }

  return repository.updateProfile(userId, input);
};

export const updateAvatar = async (
  userId: string,
  file: Express.Multer.File,
) => {
  const profile =
    await repository.findProfileByUserId(
      userId,
    );

  if (!profile) {
    throw new AppError(
      "Profile not found",
      404,
      "PROFILE_NOT_FOUND",
    );
  }

  if (profile.avatarPublicId) {
    await deleteImage(
      profile.avatarPublicId,
    );
  }

  const image = await uploadImage(
    file.buffer,
    "avatars",
  );

  return repository.updateAvatar(
    userId,
    image.url,
    image.publicId,
  );
};

export const deleteAvatar = async (
  userId: string,
) => {
  const profile =
    await repository.findProfileByUserId(
      userId,
    );

  if (!profile) {
    throw new AppError(
      "Profile not found",
      404,
      "PROFILE_NOT_FOUND",
    );
  }

  if (profile.avatarPublicId) {
    await deleteImage(
      profile.avatarPublicId,
    );
  }

  return repository.removeAvatar(
    userId,
  );
};