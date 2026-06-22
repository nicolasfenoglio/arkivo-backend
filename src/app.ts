import express from "express";
import profileRouter from "./routes/profiles.route.js";
import departmentRouter from "./routes/departments.route.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Hello, World!");
});

app.use("/profiles", profileRouter);
app.use("/departments", departmentRouter);

export default app;
