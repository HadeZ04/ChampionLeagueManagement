import fs from "fs/promises";
import path from "path";

const DEFAULT_DATA_DIR = path.resolve(process.cwd(), "data");

function resolveDataDir() {
  const configured = process.env.DATA_DIR;
  if (configured && configured.trim()) {
    return path.resolve(process.cwd(), configured.trim());
  }
  return DEFAULT_DATA_DIR;
}

async function ensureDataDir(): Promise<string> {
  const dir = resolveDataDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  const dir = await ensureDataDir();
  const fullPath = path.join(dir, filename);
  try {
    const raw = await fs.readFile(fullPath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const dir = await ensureDataDir();
  const fullPath = path.join(dir, filename);
  const tmpPath = `${fullPath}.tmp`;
  const payload = JSON.stringify(data, null, 2);
  await fs.writeFile(tmpPath, payload, "utf8");
  await fs.rename(tmpPath, fullPath);
}

