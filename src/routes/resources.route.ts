import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { body, param, validationResult } from "express-validator";
import { sessionMiddleware } from "../middlewares/session.middleware.js";
import { Resource } from "../models/resource.model.js";
import { Note } from "../models/note.model.js";
import s3Bucket from "../services/s3_bucket.service.js";
import profileRequiredMiddleware from "../middlewares/profile-required.middleware.js";

const validatePresignData = [
  param("noteId")
    .isInt({ min: 1 })
    .withMessage("noteId must be a positive integer"),
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

    if (!note.visible && note.authorId !== req.profile!.id) {
      return res.status(403).json({
        error: "forbidden",
        message: "You can only access visible notes",
      });
    }

    if (!resource.key) {
      return res.status(404).json({
        error: "not_found",
        message: "Resource not found",
      });
    }

    const downloadUrl = await s3Bucket.generateDownloadUrl({
      key: resource.key,
    });

    return res.status(200).json({ downloadUrl });
  },
);

const validateCreateResource = [
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
];

router.post(
  "/:noteId",
  sessionMiddleware,
  profileRequiredMiddleware,
  validateCreateResource,
  async (req: Request, res: Response) => {
    const { noteId } = req.params;
    const { filename, key } = req.body;

    const note = await Note.findOne({
      where: {
        id: noteId,
        authorId: req.profile!.id,
      },
    });

    if (!note) {
      return res.status(404).json({
        error: "not_found",
        message: "Note not found",
      });
    }

    if (!key.startsWith(`notes/${note.id}/`)) {
      return res.status(400).json({
        error: "invalid_key",
        message: "Invalid resource key",
      });
    }

    if (!(await s3Bucket.exists(key))) {
      return res.status(400).json({
        error: "upload_not_found",
        message: "The file has not been uploaded",
      });
    }

    const resource = await Resource.create({
      noteId: Number(noteId),
      fileName: filename,
      key,
    });

    return res.status(201).json(resource);
  },
);

router.post(
  "/:noteId/presign",
  sessionMiddleware,
  profileRequiredMiddleware,
  validatePresignData,
  async (req: Request, res: Response) => {
    const { noteId } = req.params;

    const note = await Note.findOne({
      where: {
        id: noteId,
        authorId: req.profile!.id,
      },
    });

    if (!note) {
      return res.status(404).json({
        error: "not_found",
        message: "Note not found",
      });
    }

    const { uploadUrl, key } = await s3Bucket.generateUploadUrl({
      noteUid: note.id,
    });

    return res.json({
      uploadUrl,
      key,
    });
  },
);

export default router;
