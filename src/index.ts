import "dotenv/config";
import app from "./app.js";
import { initializeApp, applicationDefault } from "firebase-admin";
import sequelize from "./models/index.js";
import { Department } from "./models/department.model.js";

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

const DEFAULT_DEPARTMENTS = [
  { name: "Materias Basicas" },
  { name: "Ingeniería en Sistemas de Información" },
  { name: "Ingeniería Industrial" },
  { name: "Ingeniería Eléctrica" },
  { name: "Ingeniería Mecánica" },
  { name: "Ingeniería Química" },
];

async function seedDepartments() {
  const count = await Department.count();
  if (count > 0) return;

  await Department.bulkCreate(DEFAULT_DEPARTMENTS);
  console.log(`Seeded ${DEFAULT_DEPARTMENTS.length} departments.`);
}

async function bootstrap() {
  await sequelize.sync({ alter: true });
  await seedDepartments();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start the server:", error);
  process.exit(1);
});
