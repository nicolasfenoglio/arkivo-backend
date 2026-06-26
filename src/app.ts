import express from "express";
import cors from "cors";
import profileRouter from "./routes/profiles.route.js";
import departmentRouter from "./routes/departments.route.js";
import commentRouter from "./routes/comments.route.js";
import reportRouter from "./routes/reports.route.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("Hello, World!");
});

app.use("/profiles", profileRouter);
app.use("/departments", departmentRouter);
app.use("/comments", commentRouter);
app.use("/reports", reportRouter);

export default app;
