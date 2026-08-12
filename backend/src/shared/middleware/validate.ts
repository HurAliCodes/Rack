import { NextFunction, Request, Response } from "express";
import { z, ZodObject } from "zod";

export const validate = (schema: ZodObject<any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return next(result.error);
    }

    req.body = result.data.body;
    req.query = result.data.query as any;
    req.params = result.data.params as any;

    next();
  };
};