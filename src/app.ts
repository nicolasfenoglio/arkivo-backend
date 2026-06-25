import express from "express";
import profileRouter from "./routes/profiles.route.js";
import departmentRouter from "./routes/departments.route.js";
import commentRouter from "./routes/comments.route.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Hello, World!");
});

app.use("/profiles", profileRouter);
app.use("/departments", departmentRouter);
app.use("/comments", commentRouter);

export default app;
