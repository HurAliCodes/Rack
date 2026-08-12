import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { env } from "../../config/env";
import { AppError } from "../../shared/errors/AppError";
import { AUTH_ERRORS } from "./constants";
import * as repository from "./repository";
import type {
  AuthTokens,
  LoginInput,
  RegisterInput,
} from "./types";

const SALT_ROUNDS = 12;

const generateAccessToken = (
  userId: string,
  role: string,
): string => {
  return jwt.sign(
    {
      sub: userId,
      role,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );
};

const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

const hashToken = (token: string): string => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

const getRefreshTokenExpiry = (): Date => {
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + 7);

  return expiresAt;
};

export const register = async (
  input: RegisterInput,
): Promise<AuthTokens> => {
  const existingUser = await repository.findUserByEmail(
    input.email,
  );

  if (existingUser) {
    throw new AppError(
      "Email is already registered",
      409,
      AUTH_ERRORS.EMAIL_ALREADY_EXISTS,
    );
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    SALT_ROUNDS,
  );

  const user = await repository.createUser({
    email: input.email,
    passwordHash,
    name: input.name,
  });

  const accessToken = generateAccessToken(
    user.id,
    user.role,
  );

  const refreshToken = generateRefreshToken();

  await repository.createRefreshToken({
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    expiresAt: getRefreshTokenExpiry(),
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const login = async (
  input: LoginInput,
): Promise<AuthTokens> => {
  const user = await repository.findUserByEmail(
    input.email,
  );

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401,
      AUTH_ERRORS.INVALID_CREDENTIALS,
    );
  }

  const passwordValid = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new AppError(
      "Invalid email or password",
      401,
      AUTH_ERRORS.INVALID_CREDENTIALS,
    );
  }

  const accessToken = generateAccessToken(
    user.id,
    user.role,
  );

  const refreshToken = generateRefreshToken();

  await repository.createRefreshToken({
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    expiresAt: getRefreshTokenExpiry(),
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const refresh = async (
  refreshToken: string,
): Promise<AuthTokens> => {
  const tokenHash = hashToken(refreshToken);

  const storedToken =
    await repository.findRefreshToken(tokenHash);

  if (
    !storedToken ||
    storedToken.revokedAt !== null ||
    storedToken.expiresAt <= new Date()
  ) {
    throw new AppError(
      "Invalid refresh token",
      401,
      AUTH_ERRORS.INVALID_REFRESH_TOKEN,
    );
  }

  await repository.revokeRefreshToken(
    storedToken.id,
  );

  const accessToken = generateAccessToken(
    storedToken.user.id,
    storedToken.user.role,
  );

  const newRefreshToken = generateRefreshToken();

  await repository.createRefreshToken({
    tokenHash: hashToken(newRefreshToken),
    userId: storedToken.user.id,
    expiresAt: getRefreshTokenExpiry(),
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (
  refreshToken: string,
): Promise<void> => {
  const tokenHash = hashToken(refreshToken);

  const storedToken =
    await repository.findRefreshToken(tokenHash);

  if (!storedToken) {
    return;
  }

  await repository.revokeRefreshToken(
    storedToken.id,
  );
};