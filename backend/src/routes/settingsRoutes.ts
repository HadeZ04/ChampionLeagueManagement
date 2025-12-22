import { Router } from "express";
import { z } from "zod";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import { logEvent } from "../services/auditService";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "../services/settingsService";
import { AuthenticatedRequest } from "../types";

const router = Router();
const requireSettingsPermission = [requireAuth, requirePermission("manage_users")] as const;

const settingsSchema = z.object({
  general: z.object({
    siteName: z.string().trim().min(1),
    siteDescription: z.string().trim().min(1),
    timezone: z.string().trim().min(1),
    language: z.string().trim().min(1),
    maintenanceMode: z.boolean(),
  }),
  security: z.object({
    sessionTimeout: z.number().int().min(1).max(720),
    passwordMinLength: z.number().int().min(6).max(64),
    requireTwoFactor: z.boolean(),
    allowedLoginAttempts: z.number().int().min(1).max(20),
    lockoutDuration: z.number().int().min(1).max(240),
  }),
  notifications: z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    adminAlerts: z.boolean(),
  }),
  api: z.object({
    rateLimit: z.number().int().min(1).max(10000),
    rateLimitWindow: z.number().int().min(1).max(1440),
    enableCors: z.boolean(),
    corsOrigins: z.string().trim(),
    apiVersion: z.string().trim().min(1),
  }),
});

router.get("/", ...requireSettingsPermission, async (_req, res, next) => {
  try {
    const settings = await getSettings();
    res.json({ data: settings });
  } catch (error) {
    next(error);
  }
});

router.put("/", ...requireSettingsPermission, async (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = settingsSchema.parse(req.body ?? DEFAULT_SETTINGS);
    const saved = await saveSettings(payload);

    await logEvent({
      eventType: "SETTINGS_UPDATED",
      severity: "warning",
      actorId: req.user?.sub,
      actorUsername: req.user?.username,
      actorRole: Array.isArray(req.user?.roles) ? req.user.roles[0] : undefined,
      entityType: "SETTINGS",
      entityId: "global",
    });

    res.json({ data: saved });
  } catch (error) {
    next(error);
  }
});

export default router;

