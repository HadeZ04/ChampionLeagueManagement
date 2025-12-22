import { readJsonFile, writeJsonFile } from "../utils/jsonStore";

export interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    allowedLoginAttempts: number;
    lockoutDuration: number;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    adminAlerts: boolean;
  };
  api: {
    rateLimit: number;
    rateLimitWindow: number;
    enableCors: boolean;
    corsOrigins: string;
    apiVersion: string;
  };
}

export const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    siteName: "UEFA Champions League",
    siteDescription: "Official UEFA Champions League Website",
    timezone: "Europe/London",
    language: "en",
    maintenanceMode: false,
  },
  security: {
    sessionTimeout: 24,
    passwordMinLength: 8,
    requireTwoFactor: false,
    allowedLoginAttempts: 5,
    lockoutDuration: 30,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    adminAlerts: true,
  },
  api: {
    rateLimit: 100,
    rateLimitWindow: 15,
    enableCors: true,
    corsOrigins: "http://localhost:3000",
    apiVersion: "v1",
  },
};

const STORE_FILE = "settings.json";

export async function getSettings(): Promise<SystemSettings> {
  return readJsonFile<SystemSettings>(STORE_FILE, DEFAULT_SETTINGS);
}

export async function saveSettings(next: SystemSettings): Promise<SystemSettings> {
  await writeJsonFile<SystemSettings>(STORE_FILE, next);
  return next;
}

