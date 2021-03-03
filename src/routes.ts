import { Request, Response, Router } from "express";

const router = Router();

router.get("/surveys", (request: Request, response: Response) => {
  return response.json({
    message: "it's working!",
  });
});

export { router };
