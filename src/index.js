import "dotenv/config";

import express from "express";
import Bucket from "./services/s3_bucket.service.js";

[
  "S3_ENDPOINT",
  "S3_ACCESS_KEY",
  "S3_SECRET_KEY",
  "S3_BUCKET",
  "S3_REGION",
  "DATABASE_URL",
].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Environment variable ${key} is not set.`);
    process.exit(1);
  }
});

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.status(200).send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
