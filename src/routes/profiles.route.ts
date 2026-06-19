import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Profile } from "../models/profile.model.js";
import { body, validationResult } from "express-validator";
import { sessionMiddleware } from "../middlewares/session.middleware.js";

const validateProfileDate = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isString()
    .withMessage("First name must be a string"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isString()
    .withMessage("Last name must be a string"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const router = Router();

router.get("/@me", sessionMiddleware, async (req: Request, res: Response) => {
  const { user } = req;
  if (!user || !user.uid)
    return res.status(401).json({
      error: "missing_bearer_token",
      message: "Unauthorized",
    });

  const profile = await Profile.findOne({
    where: {
      authId: user.uid,
    },
  });

  if (!profile) {
    return res.status(404).json({
      error: "not_found",
      message: "Profile not found",
    });
  }

  return res.json(profile.toJSON());
});

router.post(
  "/",
  sessionMiddleware,
  validateProfileDate,
  async (req: Request, res: Response) => {
    const { user, body } = req;
    if (!user || !user.uid)
      return res.status(401).json({
        message: "Unauthorized",
        error: "missing_bearer_token",
      });
    try {
      const profile = await Profile.create({
        authId: user.uid,
        ...body,
      });

      return res.status(201).json({ id: profile.id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
        error: "internal_server_error",
      });
    }
  },
);

router.put(
  "/",
  sessionMiddleware,
  validateProfileDate,
  async (req: Request, res: Response) => {
    const { user, body } = req;
    if (!user || !user.uid)
      return res.status(401).json({
        error: "missing_bearer_token",
        message: "Unauthorized",
      });

    try {
      const profile = await Profile.findOne({
        where: {
          authId: user.uid,
        },
      });

      if (!profile)
        return res.status(404).json({
          error: "not_found",
          message: "Profile not found",
        });

      profile.set(body);
      await profile.save();

      return res.status(200).json({ id: profile.id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "internal_server_error",
        message: "Internal server error",
      });
    }
  },
);

export default router;
