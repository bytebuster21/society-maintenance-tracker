import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware.js";

export const requireRole = (roles: Array<"RESIDENT" | "ADMIN">) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: Insufficient privileges" });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(["ADMIN"]);
