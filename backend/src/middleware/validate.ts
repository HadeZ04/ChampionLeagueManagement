import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { BadRequestError } from "../utils/httpError";

type ValidationTarget = "body" | "query" | "params";

interface ValidationSpec {
  schema: ZodSchema;
  target?: ValidationTarget;
}

export function validate({ schema, target = "body" }: ValidationSpec) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      throw BadRequestError("Validation failed", result.error.flatten());
    }
    req[target] = result.data;
    next();
  };
}
