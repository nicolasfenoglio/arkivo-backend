import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Profile } from "../models/profile.model.js";
import { body, param, validationResult } from "express-validator";
import { sessionMiddleware } from "../middlewares/session.middleware.js";
import { Resource } from "../models/resource.model.js";
import { Note } from "../models/note.model.js";
import s3Bucket from "../services/s3_bucket.service.js";
import profileRequiredMiddleware from "../middlewares/profile-required.middleware.js";

const validateResourceData = [
  body("noteId")
    .isInt({ min: 1 })
    .withMessage("noteId must be a positive integer"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("url")
    .trim()
    .notEmpty()
    .withMessage("URL is required")
    .isString()
    .withMessage("URL must be a string")
    .isURL()
    .withMessage("URL must be a valid URL"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
const validatePresignData = [
  param("noteId")
    .isInt({ min: 1 })
    .withMessage("noteId must be a positive integer"),
  body("filename")
    .trim()
    .notEmpty()
    .withMessage("Filename is required")
    .isString()
    .withMessage("Filename must be a string"),
  body("contentType")
    .trim()
    .notEmpty()
    .withMessage("contentType is required")
    .isString()
    .withMessage("contenType must be a string"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const router = Router();
router.get("/:noteId", async (req: Request, res: Response) => {
  const { noteId } = req.params;
  const note = await Note.findByPk(noteId);
  if (!note) {
    return res.status(404).json({
      error: "not_found",
      message: "Note not found",
    });
  }
  if (!note.visible) {
    return res.status(403).json({
      error: "forbidden",
      message: "You can only access visible notes",
    });
  }
  const resources = await Resource.findAll({
    where: { noteId },
    include: [{ model: Note, attributes: ["name"] }],
  });
  res.status(200).json(resources);
});

router.get(
  "/download/:id",
  sessionMiddleware,
  profileRequiredMiddleware,
  validatePresignData,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const resource = await Resource.findByPk(id, { raw: true });

    if (!resource) {
      return res.status(404).json({
        error: "not_found",
        message: "Resource not found",
      });
    }

    const { noteId } = resource;

    const note = await Note.findByPk(noteId);

    if (!note) {
      return res.status(404).json({
        error: "not_found",
        message: "Note not found",
      });
    }

    if (!note.visible) {
      return res.status(403).json({
        error: "forbidden",
        message: "You can only access visible notes",
      });
    }

    const downloadUrl = await s3Bucket.generateDownloadUrl({
      key: resource.key,
    });

    return res.status(200).json({ downloadUrl });
  },
);

router.post(
  "/presign/:noteId",
  sessionMiddleware,
  profileRequiredMiddleware,
  validatePresignData,
  async (req: Request, res: Response) => {
    const { noteId } = req.params;
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({
        error: "invalid_request",
        message: "noteId, filename and contentType are required",
      });
    }

    try {
      const note = await Note.findByPk(noteId);
      if (!note) {
        return res.status(404).json({
          error: "not_found",
          message: "Note not found",
        });
      }

      const profile = await Profile.findOne({
        where: { authId: req.user?.uid },
      });

      if (!profile) {
        return res.status(404).json({
          error: "not_found",
          message: "Profile not found",
        });
      }

      if (note.authorId !== profile.id) {
        return res.status(403).json({
          error: "forbidden",
          message: "You can only upload resources to your own notes",
        });
      }

      const { key, uploadUrl } = await s3Bucket.generateUploadUrl({
        noteUid: String(note.id),
        filename,
        contentType,
      });

      const resource = await Resource.create({
        key: key,
        fileName: filename,
        noteId: note.id,
      });

      return res.status(200).json({ key, uploadUrl });
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
