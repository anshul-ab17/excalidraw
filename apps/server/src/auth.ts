import { Router, Request, Response } from "express";
import { JWT_SECRET } from "@repo/common-in-backend/config";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware.js";
import { CreateRoomSchema, CreateUserSchema, SignInSchema } from "@repo/common-in-apps/types";
import { prismaClient} from "@repo/db/client"

const router: Router = Router();
router.post("/signup", async (req: Request, res: Response) => {

  const parsedData= CreateUserSchema.safeParse(req.body);
  if(!parsedData.success){
    res.json({
      message:"Incorrect Credentials"
    })
    return;
  }
  try {
    await prismaClient.user.create({
      data:{
        email:parsedData.data?.username,
        password:parsedData.data.password,
        username:parsedData.data.username
      }
    })
    res.json({
    userId:"1344"
  })
  } catch(e) {
    res.status(411).json({
      message:"user already exist"
    })
  }
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
