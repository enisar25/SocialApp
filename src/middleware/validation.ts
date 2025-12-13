import type { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";


export const validationMiddleware = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = {
      ...req.body,
      ...req.params,
      ...req.query,  
    };
    const result = schema.safeParse(dataToValidate);
    if (!result.success) {
      return res.status(422).json({
        message: "Validation error",
        error: result.error,
      });
    }
    next();
};
}