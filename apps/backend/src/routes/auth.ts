import { Router, Request, Response } from "express";
import { JWT_SECRET } from "@repo/common-in-backend/config";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";

const router: Router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // hash password before saving
  // save user to database

  res.status(201).json({
    id: username
  });
});

router.post("/signin", async (req: Request, res: Response) => {
    
    const userId=1;
    const token = jwt.sign({
        userId
    },JWT_SECRET)

    res.json({
        token
    });
});

router.post("/room", middleware, async(req , res) => {

    res.json({
      roomId:333
    })
})

export default router;
