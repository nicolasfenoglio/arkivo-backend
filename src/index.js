import "dotenv/config";
import app from "./app.js";
import { initializeApp, applicationDefault } from "firebase-admin";

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

const PORT = 3000;

initializeApp({
  credential: applicationDefault(),
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
