import {Router,
     type Request, 
     type Response,
    }from "express";

import{Subject}from "../models/subject.model.js";

const router = Router();

router.get("/all", async (req: Request, res: Response) => {
    const { departamentoId,  nivel } = req.query;
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

export default router;

