import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { env } from "../../config/env";
import { AppError } from "../../shared/errors/AppError";
import { AUTH_ERRORS } from "./constants";
import * as repository from "./repository";
import { sendEmail } from "../../infrastructure/email/email";

import type {
  AuthTokens,
  LoginInput,
  RegisterInput,
} from "./types";

import { findUserById } from "./repository";

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

  const verificationToken = generateRefreshToken();

  await repository.createEmailVerificationToken({
    tokenHash: hashToken(verificationToken),
    userId: user.id,
    expiresAt: new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ),
  });

  const verificationUrl =
    `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your AI Digital Wardrobe email",
    html: `
      <h2>Welcome to AI Digital Wardrobe!</h2>

      <p>
        Please verify your email address to activate your account.
      </p>

      <p>
        <a href="${verificationUrl}">
          Verify Email
        </a>
      </p>

      <p>This link expires in 24 hours.</p>
    `,
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

export const requestPasswordReset = async (
  email: string,
): Promise<void> => {
  const user = await repository.findUserByEmail(email);

  if (!user) {
    return;
  }

  const token = generateRefreshToken();

  await repository.createPasswordResetToken({
    tokenHash: hashToken(token),
    userId: user.id,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  const resetUrl =
    `${env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your AI Digital Wardrobe password",
    html: `
      <h2>Password Reset</h2>

      <p>You requested to reset your password.</p>

      <p>
        Click the link below to create a new password:
      </p>

      <p>
        <a href="${resetUrl}">
          Reset Password
        </a>
      </p>

      <p>This link expires in 15 minutes.</p>

      <p>
        If you didn't request this, you can safely ignore this email.
      </p>
    `,
  });
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  const tokenHash = hashToken(token);

  const resetToken =
    await repository.findPasswordResetToken(tokenHash);

  if (
    !resetToken ||
    resetToken.usedAt !== null ||
    resetToken.expiresAt <= new Date()
  ) {
    throw new AppError(
      "Invalid or expired password reset token",
      400,
      AUTH_ERRORS.INVALID_RESET_TOKEN,
    );
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    SALT_ROUNDS,
  );

  await repository.updateUserPassword(
    resetToken.userId,
    passwordHash,
  );

  await repository.markPasswordResetTokenUsed(
    resetToken.id,
  );
};

export const verifyEmail = async (
  token: string,
): Promise<void> => {
  const tokenHash = hashToken(token);

  const verificationToken =
    await repository.findEmailVerificationToken(
      tokenHash,
    );

  if (
    !verificationToken ||
    verificationToken.usedAt !== null ||
    verificationToken.expiresAt <= new Date()
  ) {
    throw new AppError(
      "Invalid or expired verification token",
      400,
      AUTH_ERRORS.INVALID_VERIFICATION_TOKEN,
    );
  }

  await repository.markUserEmailVerified(
    verificationToken.userId,
  );

  await repository.markEmailVerificationTokenUsed(
    verificationToken.id,
  );
};

export const getCurrentUser = async (userId: string) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      AUTH_ERRORS.USER_NOT_FOUND
    );
  }

  return user;
};

// export const requestPasswordReset = async (
//   email: string,
// ): Promise<string | null> => {
//   const user = await repository.findUserByEmail(email);

//   // Don't reveal whether an email exists.
//   if (!user) {
//     return null;
//   }

//   const token = generateRefreshToken();

//   await repository.createPasswordResetToken({
//     tokenHash: hashToken(token),
//     userId: user.id,
//     expiresAt: new Date(Date.now() + 15 * 60 * 1000),
//   });

//   // Temporary:
//   // In the next step we'll send this through an email service.
//   return token;
// };