import { Router, type Request, type Response } from "express";

import { Subject } from "../models/subject.model.js";
import { sessionMiddleware } from "../middlewares/session.middleware.js";
import profileRequiredMiddleware from "../middlewares/profile-required.middleware.js";
import { body } from "express-validator";

const router = Router();

router.get("/all", async (req: Request, res: Response) => {
  const { departamentoId, nivel } = req.query;
  const where: any = {};
  if (departamentoId) {
    where.departamentoId = departamentoId;
  }
  if (nivel) {
    where.level = Number(nivel);
  }
  const subjects = await Subject.findAll({
    where,
    raw: true,
  });
  return res.json(subjects);
});

router.get("/:uid", async (_req: Request, res: Response) => {
  const subject = await Subject.findOne({
    where: { id: Number(_req.params.uid) },
    raw: true,
  });
  if (!subject) {
    return res.status(404).json({ error: "Subject not found" });
  }
  return res.json(subject);
});

router.get("/:uid/subjects", async (req: Request, res: Response) => {
  const subjects = await Subject.findAll({
    where: { departmentid: Number(req.params.uid) },
    raw: true,
  });
  return res.json(subjects);
});

const validateSubjectData = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("departmentId")
    .notEmpty()
    .withMessage("Department ID is required")
    .isInt({ min: 1 })
    .withMessage("Department ID must be an integer"),
  body("level")
    .notEmpty()
    .withMessage("Level is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Level must be an integer between 1 and 5"),
  body("studyplan")
    .trim()
    .optional()
    .isString()
    .withMessage("Study plan must be a string"),
];

router.post(
  "/",
  sessionMiddleware,
  profileRequiredMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { name, departmentId, level, studyplan } = req.body;

      const subject = await Subject.create({
        name,
        departmentid: Number(departmentId),
        level: Number(level),
        studyplan: studyplan || "Plan 2023",
      });

      return res.status(201).json({
        id: subject.id,
        name: subject.name,
        departmentId: subject.departmentid,
        level: subject.level,
        studyplan: subject.studyplan,
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
