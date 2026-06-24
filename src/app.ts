import express from "express";
import cors from "cors";
import profileRouter from "./routes/profiles.route.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("Hello, World!");
});

app.use("/profiles", profileRouter);

export default app;
