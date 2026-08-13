import { AppError } from "../../shared/errors/AppError";
import * as repository from "./repository";
import { UpdateProfileInput } from "./types";

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