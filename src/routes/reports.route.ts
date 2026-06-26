import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Report } from "../models/report.model.js";
import { body, validationResult } from "express-validator";
import { sessionMiddleware } from "../middlewares/session.middleware.js";
import profileRequiredMiddleware from "../middlewares/profile-required.middleware.js";

const validateReportData = [
  body("noteId")
    .notEmpty()
    .withMessage("noteId is required")
    .isInt()
    .withMessage("noteId must be an integer"),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason is required")
    .isString()
    .withMessage("Reason must be a string"),

  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isString()
    .withMessage("State must be a string"),

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
  const reports = await Report.findAll();

  return res.json(reports);
});

router.get("/:id", async (req: Request, res: Response) => {
  const report = await Report.findByPk(req.params.id);

  if (!report) {
    return res.status(404).json({
      error: "not_found",
      message: "Report not found",
    });
  }

  return res.json(report);
});

router.post("/",sessionMiddleware, profileRequiredMiddleware, validateReportData, async (req: Request, res: Response) => {
    try {
      const report = await Report.create({
        noteId: req.body.noteId,
        reporterId: req.profile!.id,
        reason: req.body.reason,
        state: req.body.state,
      });

      return res.status(201).json({
        id: report.id,
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

router.put("/:id",sessionMiddleware, profileRequiredMiddleware, validateReportData, async (req: Request, res: Response) => {
    try {
      const report = await Report.findByPk(req.params.id);

      if (!report) {
        return res.status(404).json({
          error: "not_found",
          message: "Report not found",
        });
      }

      report.noteId = req.body.noteId;
      report.reason = req.body.reason;
      report.state = req.body.state;

      await report.save();

      return res.json({
        id: report.id,
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