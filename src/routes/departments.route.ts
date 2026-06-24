import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Department } from "../models/department.model.js";
import { body, validationResult } from "express-validator";
import { sessionMiddleware } from "../middlewares/session.middleware.js";
import profileRequiredMiddleware from "../middlewares/profile-required.middleware.js";

const validateDepartmentData = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

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
  const departments = await Department.findAll();

  return res.json(departments);
});

router.get("/:id", async (req: Request, res: Response) => {
  const department = await Department.findByPk(req.params.id);

  if (!department) {
    return res.status(404).json({
      error: "not_found",
      message: "Department not found",
    });
  }

  return res.json(department);
});

router.post("/",sessionMiddleware, profileRequiredMiddleware, validateDepartmentData, async (req: Request, res: Response) => {
    const { user } = req;
    if (!user || !user.uid)
      return res.status(401).json({
        error: "missing_bearer_token",
        message: "Unauthorized",
      });

    try {
      const department = await Department.create({
        name: req.body.name,
      });

      return res.status(201).json({
        id: department.id,
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

router.put("/:id",sessionMiddleware, profileRequiredMiddleware, validateDepartmentData, async (req: Request, res: Response) => {
    const { user } = req;
    if (!user || !user.uid)
      return res.status(401).json({
        error: "missing_bearer_token",
        message: "Unauthorized",
      });

    try {
      const department = await Department.findByPk(req.params.id);

      if (!department) {
        return res.status(404).json({
          error: "not_found",
          message: "Department not found",
        });
      }

      department.name = req.body.name;

      await department.save();

      return res.json({
        id: department.id,
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