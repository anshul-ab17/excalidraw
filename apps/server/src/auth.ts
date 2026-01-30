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
    const user = await prismaClient.user.create({
      data:{
        email:parsedData.data?.username,
        //hashing the  password!
        password:parsedData.data.password,
        username:parsedData.data.username
      }
    })
    res.json({
    userId:user.id
  })
  } catch(e) {
    res.status(411).json({
      message:"user already exist with that username"
    })
  }
});

router.post("/signin", async (req: Request, res: Response) => {
    const parsedData= SignInSchema.safeParse(req.body);
    if(!parsedData.success){
      res.json({
        message:"Incorrect Credentials"
      })
      return;
    }

    //compare hashed password
    const user = await prismaClient.user.findFirst({
      where:{
        email:parsedData.data.username,
        password:parsedData.data.password,
      }
    }) 

    if(!user){
      res.status(403).json({
        message:"Not authorized!"
      })
      return;
    }
    const token = jwt.sign({
        userId:user?.id
    },JWT_SECRET)

    res.json({
        token
    });
});

router.post("/room", middleware, async(req , res) => {
    const parsedData= CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
      res.json({
        message:"Incorrect Credentials"
      })
      return;
    }
    //@ts-ignore:
    const userId =req.userId;

    await prismaClient.room.create({
      data:{
        slug:parsedData.data.name,
        admin:userId
      }
    })

    res.json({
      roomId:userId
    })
})

export default router;
