import express from "express";
import profileRouter from "./routes/profiles.route.js";
import notesRouter from "./routes/notes.route.js";
<<<<<<< HEAD
import subjectsRouter from "./routes/Subjects.route.js";
=======
import resourcesRouter from "./routes/resources.route.js";

>>>>>>> cefff85ef1279be84e2a7ab0c64c232f71d32a56
const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("Hello, World!");
});

app.use("/profiles", profileRouter);
app.use("/notes", notesRouter);
<<<<<<< HEAD
app.use("/subjects", subjectsRouter);
=======
app.use("/resources", resourcesRouter);
>>>>>>> cefff85ef1279be84e2a7ab0c64c232f71d32a56

export default app;
