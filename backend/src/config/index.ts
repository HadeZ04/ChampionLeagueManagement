import path from "path";
import { config as loadDotenv } from "dotenv";

const NODE_ENV = process.env.NODE_ENV ?? "development";

loadDotenv({
  path: path.resolve(process.cwd(), ".env"),
});

const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME", "JWT_SECRET"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️  Environment variable ${key} is not set.`);
  }
});

export const appConfig = {
  env: NODE_ENV,
  port: Number(process.env.PORT ?? 4000),
  jwt: {
    secret: process.env.JWT_SECRET ?? "dev-secret",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "2h",
  },
  db: {
    host: process.env.DB_HOST ?? "localhost",
    user: process.env.DB_USER ?? "sa",
    password: process.env.DB_PASS ?? "",
    name: process.env.DB_NAME ?? "LeagueManagement",
  },
};

export type AppConfig = typeof appConfig;
