import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";

// Cargar variables de entorno desde .env y .env.local
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
