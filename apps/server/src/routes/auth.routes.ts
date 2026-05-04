import { Router, IRouter } from "express";
import rateLimit from "express-rate-limit";
import { signup, signin } from "../controllers/auth.controller.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts — try again later" },
});

const router: IRouter = Router();

router.post("/signup", authLimiter, signup);
router.post("/signin", authLimiter, signin);

export default router;
