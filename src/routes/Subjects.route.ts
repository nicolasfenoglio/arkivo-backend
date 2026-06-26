import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { Subject } from "../models/subject.model.js";
import { param, query, validationResult } from "express-validator";

const router = Router();

const validateQueryParams = [
  query("departamentoId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Id must be a positive integer"),
  query("nivel")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Nivel must be a positive integer"),
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

router.get("/all", validateQueryParams, async (req: Request, res: Response) => {
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
    attributes: ["id", "name"],
    raw: true,
  });
  return res.json(subjects);
});

const validateIdParam = [
  param("uid").isInt({ min: 1 }).withMessage("Id must be a positive integer"),
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

router.get("/:uid", validateIdParam, async (_req: Request, res: Response) => {
  const subject = await Subject.findOne({
    where: { id: Number(_req.params.uid) },
    raw: true,
  });
  if (!subject) {
    return res.status(404).json({ error: "Subject not found" });
  }
  return res.json(subject);
});

export default router;
