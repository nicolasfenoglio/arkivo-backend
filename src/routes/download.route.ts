import { Router, type Request, type Response } from "express";
import { Download } from "../models/download.model.js";
import { Profile } from "../models/profile.model.js";

const router = Router();
router.get("/", async (_req: Request, res: Response) => {
  const downloads = await Download.findAll({
    include: [{ model: Profile, attributes: ["recursoid", "createAt"] }],
  });
  res.status(200).json(downloads);
});
