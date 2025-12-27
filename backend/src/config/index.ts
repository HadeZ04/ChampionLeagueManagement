import path from "path";
import { config as loadDotenv } from "dotenv";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const isTestEnv = NODE_ENV === "test";

if (!isTestEnv) {
  // eslint-disable-next-line no-console
  console.log("Current CWD:", process.cwd());
}
const result = loadDotenv({
  path: path.resolve(process.cwd(), ".env"),
});
if (result.error) {
  // eslint-disable-next-line no-console
  console.error("Dotenv error:", result.error);
} else {
  const shouldMask = (key: string) => /pass|secret|token|key/i.test(key);
  const masked = Object.fromEntries(
    Object.entries(result.parsed ?? {}).map(([key, value]) => [key, shouldMask(key) ? "***" : value])
  );

  if (!isTestEnv) {
    // eslint-disable-next-line no-console
    console.log("Dotenv loaded:", masked);
  }
}

const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME", "JWT_SECRET", "FOOTBALL_DATA_API_TOKEN"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`?s??,?  Environment variable ${key} is not set.`);
  }
});

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === "true";
};

export const appConfig = {
  env: NODE_ENV,
  port: Number(process.env.PORT ?? 4001),
  jwt: {
    secret: process.env.JWT_SECRET ?? "dev-secret",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "2h",
  },
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 1433),
    user: process.env.DB_USER ?? "sa",
    password: process.env.DB_PASS ?? "",
    name: process.env.DB_NAME ?? "LeagueManagement",
    encrypt: parseBoolean(process.env.DB_ENCRYPT, true),
    trustServerCertificate: parseBoolean(process.env.DB_TRUST_SERVER_CERTIFICATE, false),
  },
  footballData: {
    baseUrl: process.env.FOOTBALL_DATA_API_BASE_URL ?? "https://api.football-data.org/v4",
    token: process.env.FOOTBALL_DATA_API_TOKEN ?? "",
    competitionCode: process.env.FOOTBALL_DATA_COMPETITION_CODE ?? "CL",
    timeout: Number(process.env.FOOTBALL_DATA_TIMEOUT ?? 15000),
    cacheTtlMs: Number(process.env.FOOTBALL_DATA_CACHE_TTL ?? 5 * 60 * 1000),
  },
};

export type AppConfig = typeof appConfig;
