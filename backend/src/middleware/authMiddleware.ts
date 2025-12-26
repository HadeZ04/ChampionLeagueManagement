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
    if (Array.isArray(req.user.roles) && req.user.roles.includes("super_admin")) {
      next();
      return;
    }
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      throw ForbiddenError("You are not allowed to perform this action");
    }
    next();
  };
}

export function requireAnyPermission(...permissions: string[]) {
  const requested = permissions.filter((permission) => Boolean(permission));

  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw UnauthorizedError("Authentication required");
    }

    if (Array.isArray(req.user.roles) && req.user.roles.includes("super_admin")) {
      next();
      return;
    }

    if (requested.length === 0) {
      next();
      return;
    }

    const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    const hasPermission = requested.some((permission) => userPermissions.includes(permission));

    if (!hasPermission) {
      throw ForbiddenError("You are not allowed to perform this action");
    }

    next();
  };
}

// Alias for compatibility with other modules
export const authenticate = requireAuth;

// Role-based access control
export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw UnauthorizedError("Authentication required");
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
    
    // Super admin has access to everything
    if (userRoles.includes("super_admin")) {
      next();
      return;
    }

    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw ForbiddenError("You do not have the required role to perform this action");
    }

    next();
  };
}
