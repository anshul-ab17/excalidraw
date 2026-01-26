import { Router, Request, Response } from "express";
import { JWT_SECRET } from "@repo/common-in-backend/config";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SignInSchema } from "@repo/common-global/types";


const router: Router = Router();

router.post("/signup", async (req: Request, res: Response) => {

  const data= CreateUserSchema.safeParse(req.body);
  if(!data.success){
    res.json({
      message:"Incorrect Credentials"
    })
    return;
  }

  res.json({
    userId:"1344"
  })
});

router.post("/signin", async (req: Request, res: Response) => {
    const data= SignInSchema.safeParse(req.body);
    if(!data.success){
      res.json({
        message:"Incorrect Credentials"
      })
      return;
    }
    const userId=1;
    const token = jwt.sign({
        userId
    },JWT_SECRET)

    res.json({
        token
    });
});

router.post("/room", middleware, async(req , res) => {
    const data= CreateRoomSchema.safeParse(req.body);
    if(!data.success){
      res.json({
        message:"Incorrect Credentials"
      })
      return;
    }

    res.json({
      roomId:333
    })
})

export default router;
