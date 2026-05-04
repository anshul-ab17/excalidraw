import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "@repo/jwt";
import jwt from "jsonwebtoken";

// Augment Express Request so req.userId is typed everywhere — no more `as any`
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"] ?? "";
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded?.userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(403).json({ message: "Unauthorized" });
  }
}
