import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { appConfig } from "../config";
import { AuthenticatedRequest, JwtPayload } from "../types";
import { UnauthorizedError, ForbiddenError } from "../utils/httpError";

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw UnauthorizedError("Authentication token is missing");
  }

  const [, token] = authHeader.split(" ");
  if (!token) {
    throw UnauthorizedError("Authentication token is invalid");
  }

  try {
    const payload = jwt.verify(token, appConfig.jwt.secret) as JwtPayload | string;
    if (typeof payload !== "object" || payload === null || !("sub" in payload)) {
      throw UnauthorizedError("Authentication token is invalid");
    }
    req.user = payload as JwtPayload;
    next();
  } catch {
    throw UnauthorizedError("Authentication token is invalid or expired");
  }
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw UnauthorizedError("Authentication required");
    }
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      throw ForbiddenError("You are not allowed to perform this action");
    }
    next();
  };
}
