import { Router, Request, Response } from "express";

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
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // find user in database
  // compare hashed password

  res.json({
    message: "Signed in successfully"
  });
});

export default router;
