import express from "express";
import profileRouter from "./routes/profiles.route.js";
import notesRouter from "./routes/notes.route.js";
import subjectsRouter from "./routes/Subjects.route.js";
import resourcesRouter from "./routes/resources.route.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("Hello, World!");
});

app.use("/profiles", profileRouter);
app.use("/notes", notesRouter);
app.use("/subjects", subjectsRouter);
app.use("/resources", resourcesRouter);

export default app;
