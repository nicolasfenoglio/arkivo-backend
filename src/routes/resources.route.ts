import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Profile } from "../models/profile.model.js";
import { body, validationResult } from "express-validator";
import { sessionMiddleware } from "../middlewares/session.middleware.js";
import { Resource } from "../models/resource.model.js";
import { Note } from "../models/note.model.js";
import s3Bucket from "../services/s3_bucket.service.js";


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
  }
];
const validatePresignData = [
  body("noteId")
    .isInt({ min: 1 })
    .withMessage("noteId must be a positive integer"),
  body("filename")
    .trim()
    .withMessage("Filename must be a string"),
  body("contentType")
    .trim()
    .withMessage("Content type must be a string"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();   
  }
];

const router = Router();
router.get("/", async (_req: Request, res: Response) => {
  const resources = await Resource.findAll(
    {
      include: [
        { model: Note, attributes: ["name"] },
      ],
    }
  );
  res.status(200).json(resources);
});

// Generar URL prefirmada para subir un recurso
router.post(
  "/presign",
  sessionMiddleware,
  async (req: Request, res: Response) => {
    const { noteId, filename, contentType } = req.body;

    if (!noteId || !filename || !contentType) {
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
