import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { body, validationResult } from "express-validator";
import { Note } from "../models/note.model.js";
import { Profile } from "../models/profile.model.js";
import { sessionMiddleware } from "../middlewares/session.middleware.js";
import profileRequiredMiddleware from "../middlewares/profile-required.middleware.js";

import { literal, type Order } from "@sequelize/core";
import { Comment } from "../models/comment.model.js";
import { Subject } from "../models/subject.model.js";
import { Visit } from "../models/visit.model.js";

const validateNoteData = [
  body("subjectId")
    .isInt({ min: 1 })
    .withMessage("subjectId must be a positive integer"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),
  body("keywords")
    .trim()
    .notEmpty()
    .withMessage("Keywords are required")
    .isString()
    .withMessage("Keywords must be a string"),
  body("thematicUnit")
    .trim()
    .notEmpty()
    .withMessage("Thematic unit is required")
    .isString()
    .withMessage("Thematic unit must be a string"),
  body("visible")
    .optional()
    .isBoolean()
    .withMessage("Visible must be a boolean"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { departmentId, subjectId, sort } = req.query;

  let order: Order;
  switch (sort) {
    case "rating":
      order = [
        [
          literal(`(
          SELECT AVG(c.valoration)
          FROM "Comments" c
          WHERE c."noteId" = "Note".id
        )`),
          "DESC",
        ],
      ];
      break;

    case "visits":
      order = [
        [
          literal(`(
          SELECT COUNT(*)
          FROM "Visits" v
          WHERE v."noteId" = "Note".id
        )`),
          "DESC",
        ],
      ];
      break;

    default:
      order = [["id", "DESC"]];
  }

  const notes = await Note.findAll({
    where: {
      visible: true,
      ...(subjectId && { subjectId: Number(subjectId) }),
    },
    attributes: [
      "id",
      "name",
      "description",
      [
        literal(
          `(SELECT COUNT(*) FROM \"Comments\" c WHERE c."noteId" = \"Note\".id)`,
        ),
        "commentsCount",
      ],

      [
        literal(
          `(SELECT AVG(c.valoration) FROM \"Comments\" c WHERE c."noteId" = \"Note\".id)`,
        ),
        "rating",
      ],

      [
        literal(
          `(SELECT COUNT(*) FROM \"Visits\" v WHERE v."noteId" = \"Note\".id)`,
        ),
        "visitsCount",
      ],
    ],
    include: [
      {
        model: Profile,
        as: "author",
        attributes: ["firstName", "lastName"],
      },
      {
        model: Subject,
        as: "subject",
        required: true,
        attributes: ["name"],
        ...(departmentId && {
          where: {
            departmentid: Number(departmentId),
          },
        }),
      },
    ],
    group: ["Note.id", "author.id", "subject.id"],
    order,
  });

  const response = notes.map((note) => {
    const json = note.toJSON() as any;

    return {
      ...json,
      rating: {
        average: json.rating ? Number(json.rating) : 0,
        count: Number(json.commentsCount),
      },
      visits: Number(json.visitsCount),
      commentsCount: undefined,
      visitsCount: undefined,
    };
  });

  return res.json(response);
});

router.get(
  "/:id",
  sessionMiddleware,
  profileRequiredMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const note = await Note.findByPk(id, {
      order: [[{ model: Comment, as: "comments" }, "id", "DESC"]],
      attributes: {
        include: [
          [
            literal(`
              (
                SELECT COUNT(*)
                FROM "Comments" c
                WHERE c."noteId" = "Note"."id"
              )
            `),
            "commentsCount",
          ],
          [
            literal(`
              (
                SELECT AVG(c."valoration")
                FROM "Comments" c
                WHERE c."noteId" = "Note"."id"
              )
            `),
            "rating",
          ],
          [
            literal(`
              (
                SELECT COUNT(*)
                FROM "Visits" v
                WHERE v."noteId" = "Note"."id"
              )
            `),
            "visitsCount",
          ],
        ],
      },
      include: [
        {
          model: Profile,
          as: "author",
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Comment,
          as: "comments",
          attributes: ["id", "valoration", "message"],
          include: [
            {
              model: Profile,
              as: "author",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
    });

    if (!note) {
      return res.status(404).json({
        error: "not_found",
        message: "Note not found",
      });
    }

    void Visit.create({
      noteId: note.id,
      profileId: req.profile!.id,
    }).catch(console.error);

    const json = note.toJSON() as any;

    return res.json({
      ...json,
      rating: {
        average: json.rating ? Number(json.rating) : null,
        count: Number(json.commentsCount),
      },
      visits: Number(json.visitsCount),
      commentsCount: undefined,
      visitsCount: undefined,
    });
  },
);

router.post(
  "/",
  sessionMiddleware,
  profileRequiredMiddleware,
  validateNoteData,
  async (req: Request, res: Response) => {
    const { user, body } = req;

    if (!user || !user.uid) {
      return res.status(401).json({
        error: "missing_bearer_token",
        message: "Unauthorized",
      });
    }

    try {
      const profile = await Profile.findOne({
        where: {
          authId: user.uid,
        },
      });

      if (!profile) {
        return res.status(404).json({
          error: "not_found",
          message: "Profile not found",
        });
      }

      const note = await Note.create({
        authorId: profile.id,
        visible: body.visible || true,
        ...body,
      });

      return res.status(201).json({ id: note.id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "internal_server_error",
        message: "Internal server error",
      });
    }
  },
);

router.put(
  "/:id",
  sessionMiddleware,
  profileRequiredMiddleware,
  validateNoteData,
  async (req: Request, res: Response) => {
    const { user, body, params } = req;

    if (!user || !user.uid) {
      return res.status(401).json({
        error: "missing_bearer_token",
        message: "Unauthorized",
      });
    }

    try {
      const profile = await Profile.findOne({
        where: {
          authId: user.uid,
        },
      });

      if (!profile) {
        return res.status(404).json({
          error: "not_found",
          message: "Profile not found",
        });
      }

      const note = await Note.findByPk(params.id);

      if (!note) {
        return res.status(404).json({
          error: "not_found",
          message: "Note not found",
        });
      }

      if (note.authorId !== profile.id) {
        return res.status(403).json({
          error: "forbidden",
          message: "You can only update your own notes",
        });
      }

      note.set(body);
      await note.save();

      return res.status(200).json({ id: note.id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "internal_server_error",
        message: "Internal server error",
      });
    }
  },
);

router.delete(
  "/:id",
  sessionMiddleware,
  profileRequiredMiddleware,
  async (req: Request, res: Response) => {
    const { user, params } = req;

    if (!user || !user.uid) {
      return res.status(401).json({
        error: "missing_bearer_token",
        message: "Unauthorized",
      });
    }

    try {
      const profile = await Profile.findOne({
        where: {
          authId: user.uid,
        },
      });

      if (!profile) {
        return res.status(404).json({
          error: "not_found",
          message: "Profile not found",
        });
      }

      const note = await Note.findByPk(params.id);

      if (!note) {
        return res.status(404).json({
          error: "not_found",
          message: "Note not found",
        });
      }

      if (note.authorId !== profile.id) {
        return res.status(403).json({
          error: "forbidden",
          message: "You can only delete your own notes",
        });
      }

      await note.destroy();
      return res.status(204).send();
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
