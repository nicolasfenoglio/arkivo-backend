import express from "express";
import cors from "cors";
import profileRouter from "./routes/profiles.route.js";
import notesRouter from "./routes/notes.route.js";
import subjectsRouter from "./routes/subjects.route.js";
import resourcesRouter from "./routes/resources.route.js";
import departmentRouter from "./routes/departments.route.js";
import commentRouter from "./routes/comments.route.js";
import reportRouter from "./routes/reports.route.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (_req, res) => {
  res.status(200).send("Hello, World!");
});

app.use("/profiles", profileRouter);
app.use("/notes", notesRouter);
app.use("/subjects", subjectsRouter);
app.use("/resources", resourcesRouter);
app.use("/departments", departmentRouter);
app.use("/comments", commentRouter);
app.use("/reports", reportRouter);

export default app;
