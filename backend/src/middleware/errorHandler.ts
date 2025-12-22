import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      details: err.details ?? null,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation Error",
      details: err.flatten(),
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error("Unexpected error:", err);
  res.status(500).json({
    error: "Internal Server Error",
  });
}
