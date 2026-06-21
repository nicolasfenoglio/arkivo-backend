import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Profile } from "../models/profile.model.js";
import { body, validationResult } from "express-validator";
import { sessionMiddleware } from "../middlewares/session.middleware.js";
import {
  UniqueConstraintError,
  type FindAttributeOptions,
  type InferAttributes,
} from "@sequelize/core";

const validateProfileData = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isString()
    .withMessage("Username must be a string")
    .isLength({ max: 32 })
    .withMessage("Username must be at most 32 characters long"),
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

const ownProfileProjection: FindAttributeOptions<InferAttributes<Profile>> = [
  "id",
  "username",
  "email",
  "firstName",
  "lastName",
];

const profileProjection: FindAttributeOptions<InferAttributes<Profile>> = [
  "id",
  "username",
  "firstName",
  "lastName",
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
    raw: true,
    attributes: ownProfileProjection,
  });

  if (!profile) {
    return res.status(404).json({
      error: "not_found",
      message: "Profile not found",
    });
  }

  return res.json(profile);
});

router.get("/:id", sessionMiddleware, async (req: Request, res: Response) => {
  const { user, params } = req;
  if (!user || !user.uid)
    return res.status(401).json({
      message: "Unauthorized",
      error: "missing_bearer_token",
    });
  const { id } = params;
  const profile = await Profile.findOne({
    where: {
      id,
    },
    raw: true,
    attributes: profileProjection,
  });
  if (!profile)
    return res.status(404).json({
      error: "not_found",
      message: "Profile not found",
    });
  return res.json(profile);
});

router.post(
  "/",
  sessionMiddleware,
  validateProfileData,
  async (req: Request, res: Response) => {
    const { user, body } = req;
    if (!user || !user.uid || !user.email)
      return res.status(401).json({
        message: "Unauthorized",
        error: "missing_bearer_token",
      });
    try {
      const profile = await Profile.create({
        authId: user.uid,
        email: user.email,
        ...body,
      });

      return res.status(201).json({ id: profile.id });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
          error: "already_exists",
          message: "Profile already exists",
        });
      }

      console.error(error);
      return res.status(500).json({
        error: "internal_server_error",
        message: "Internal server error",
      });
    }
  },
);

router.put(
  "/",
  sessionMiddleware,
  validateProfileData,
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
