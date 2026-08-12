import { Response } from "express";

export const successResponse = <T>(
  res: Response,
  data: T,
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const createdResponse = <T>(
  res: Response,
  data: T,
) => {
  return res.status(201).json({
    success: true,
    data,
  });
};