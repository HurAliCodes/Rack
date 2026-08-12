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

    if (result.data.body) {
      Object.assign(req.body, result.data.body);
    }
    
    if (result.data.query) {
      Object.assign(req.query, result.data.query);
    }
    
    if (result.data.params) {
      Object.assign(req.params, result.data.params);
    }

    next();
  };
};