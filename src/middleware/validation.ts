import type { Request, Response, NextFunction } from "express";
import { GraphQLError } from "graphql";
import { ZodError, ZodObject } from "zod";


const formatZodErrors = (error: ZodError) => {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".") || "input";
    fields[field] = issue.message;
  }

  return fields;
};


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

export const graphqlValidation = async(schema: ZodObject,args:any) => {

    const result = await schema.safeParseAsync(args);
    if (!result.success) {
      throw new GraphQLError("validation error",{
        extensions:{
          code: "BAD_USER_INPUT",
          fields: formatZodErrors(result.error)
        }
      })
    }
    return result.data
};
