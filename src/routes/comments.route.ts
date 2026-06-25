import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Comment } from "../models/comment.model.js";
import { body, validationResult } from "express-validator";
import { sessionMiddleware } from "../middlewares/session.middleware.js";
import profileRequiredMiddleware from "../middlewares/profile-required.middleware.js";

const validateCommentData = [
  body("noteId")
    .notEmpty()
    .withMessage("noteId is required")
    .isInt()
    .withMessage("noteId must be an integer"),

  body("valoration")
    .notEmpty()
    .withMessage("Valoration is required")
    .isInt()
    .withMessage("Valoration must be an integer"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .withMessage("Message must be a string"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    next();
  },
];

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const comments = await Comment.findAll();

  return res.json(comments);
});

router.get("/:id", async (req: Request, res: Response) => {
  const comment = await Comment.findByPk(req.params.id);

  if (!comment) {
    return res.status(404).json({
      error: "not_found",
      message: "Comment not found",
    });
  }

  return res.json(comment);
});

router.post("/",sessionMiddleware, profileRequiredMiddleware, validateCommentData, async (req: Request, res: Response) => {
    try {
      const comment = await Comment.create({
        noteId: req.body.noteId,
        authorId: req.profile!.id,
        valoration: req.body.valoration,
        message: req.body.message,
      });

      return res.status(201).json({
        id: comment.id,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "internal_server_error",
        message: "Internal server error",
      });
    }
  },
);

router.put("/:id",sessionMiddleware, profileRequiredMiddleware, validateCommentData, async (req: Request, res: Response) => {
    try {
      const comment = await Comment.findByPk(req.params.id);

      if (!comment) {
        return res.status(404).json({
          error: "not_found",
          message: "Comment not found",
        });
      }

      comment.noteId = req.body.noteId;
      comment.valoration = req.body.valoration;
      comment.message = req.body.message;

      await comment.save();

      return res.json({
        id: comment.id,
      });
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