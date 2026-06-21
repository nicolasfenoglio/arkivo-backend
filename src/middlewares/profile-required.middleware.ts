import { type NextFunction, type Request, type Response } from "express";
import { Profile } from "../models/profile.model.js";

declare global {
  namespace Express {
    interface Request {
      profile?: { id: number };
    }
  }
}

export default async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { user } = req;
  if (!user || !user.uid) {
    return res.status(401).json({
      message: "Unauthorized",
      error: "missing_bearer_token",
    });
  }

  const profile = await Profile.findOne({
    where: {
      authId: user.uid,
    },
    raw: true,
    attributes: ["id"],
  });

  if (!profile) {
    return res.status(401).json({
      error: "profile_required",
      message: "You need to create a profile to perform this action",
    });
  }

  req.profile = profile;
  return next();
}
