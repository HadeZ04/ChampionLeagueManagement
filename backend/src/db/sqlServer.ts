import sql from "mssql";
import { appConfig } from "../config";

const config: sql.config = {
  user: appConfig.db.user,
  password: appConfig.db.password,
  server: appConfig.db.host,
  port: appConfig.db.port,
  database: appConfig.db.name,
  options: {
    encrypt: appConfig.db.encrypt,
    trustServerCertificate: appConfig.db.trustServerCertificate,
  },
};

let pool: sql.ConnectionPool | null = null;
let poolConnect: Promise<sql.ConnectionPool> | null = null;

async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    poolConnect = pool.connect().catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Database connection failed:", error);
      pool = null;
      poolConnect = null;
      throw error;
    });
  }

  await poolConnect;
  return pool;
}

export async function query<T = any>(
  text: string,
  params: Record<string, unknown> = {}
): Promise<sql.IResult<T>> {
  const connectedPool = await getPool();
  const request = connectedPool.request();
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value as sql.ISqlType);
  });
  return request.query<T>(text);
}

export async function transaction<T>(callback: (tx: sql.Transaction) => Promise<T>): Promise<T> {
  const connectedPool = await getPool();
  const tx = new sql.Transaction(connectedPool);
  await tx.begin();
  try {
    const result = await callback(tx);
    await tx.commit();
    return result;
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}

export type SqlTransaction = sql.Transaction;
