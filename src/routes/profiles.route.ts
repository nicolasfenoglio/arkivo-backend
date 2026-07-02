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
import s3 from "../services/s3_bucket.service.js";
import profileRequiredMiddleware from "../middlewares/profile-required.middleware.js";
import { Note } from "../models/note.model.js";
import { Comment } from "../models/comment.model.js";
import { Resource } from "../models/resource.model.js";

const CDN_URL = "http://localhost:9000/public/";

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
  "avatarKey",
];

const profileProjection: FindAttributeOptions<InferAttributes<Profile>> = [
  "id",
  "username",
  "firstName",
  "lastName",
  "avatarKey",
];

const router = Router();

router.get("/", sessionMiddleware, async (req: Request, res: Response) => {
  const { uid } = req.user!;

  const profile = await Profile.findOne({
    where: {
      authId: uid,
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

  return res.json({
    ...profile,
    avatar: `${CDN_URL}${profile.avatarKey}`,
    avatarKey: undefined,
  });
});

router.get("/@me", sessionMiddleware, async (req: Request, res: Response) => {
  const { uid } = req.user!;
  const profile = await Profile.findOne({
    where: {
      authId: uid,
    },
    attributes: ownProfileProjection,
    include: [
      {
        model: Comment,
        as: "comments",
        attributes: ["id", "message"],
        include: [
          {
            model: Note,
            as: "note",
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: Note,
        as: "notes",
        attributes: ["id", "name"],
      },
    ],
  });

  if (!profile)
    return res.status(404).json({
      error: "not_found",
      message: "Profile not found",
    });

  return res.json({
    ...profile.toJSON(),
    avatar: `${CDN_URL}${profile.avatarKey}`,
    avatarKey: undefined,
  });
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
    attributes: profileProjection,
    include: [
      {
        model: Comment,
        as: "comments",
        attributes: ["id", "message"],
        include: [
          {
            model: Note,
            as: "note",
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: Note,
        as: "notes",
        attributes: ["id", "name"],
      },
    ],
  });
  if (!profile)
    return res.status(404).json({
      error: "not_found",
      message: "Profile not found",
    });
  return res.json({
    ...profile.toJSON(),
    avatar: `${CDN_URL}${profile.avatarKey}`,
    avatarKey: undefined,
  });
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

router.post(
  "/avatar",
  sessionMiddleware,
  profileRequiredMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.profile!;
    const { key } = req.body;

    if (!key || !key.startsWith(`avatars/${id}/`)) {
      console.log({ key });
      console.log("Fallo en el startsWith");
      return res.status(400).json({
        error: "invalid_key",
        message: "Invalid resource key",
      });
    }

    if (!(await s3.exists(key, "public"))) {
      console.log("Fallo en el exists");
      return res.status(400).json({
        error: "upload_not_found",
        message: "The file has not been uploaded",
      });
    }

    const profile = await Profile.findByPk(id);

    if (!profile) {
      return res.status(404).json({
        error: "not_found",
        message: "Profile not found",
      });
    }

    profile.set({ avatarKey: key });
    await profile.save();

    return res.status(200).json({ avatar: `${CDN_URL}${profile.avatarKey}` });
  },
);

router.post(
  "/avatar/presign",
  sessionMiddleware,
  profileRequiredMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.profile!;
    const { uploadUrl, key } = await s3.generateUploadAvatarUrl({ id });
    return res.json({
      uploadUrl,
      key,
    });
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
