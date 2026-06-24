import express from "express";
import profileRouter from "./routes/profiles.route.js";
import notesRouter from "./routes/notes.route.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Hello, World!");
});

app.use("/profiles", profileRouter);
app.use("/notes", notesRouter);

export default app;
