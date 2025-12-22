import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import multer from "multer";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import { logEvent } from "../services/auditService";
import { AuthenticatedRequest } from "../types";

const router = Router();
const requireMediaManagement = [requireAuth, requirePermission("manage_content")] as const;

const mediaRoot = path.resolve(process.cwd(), "uploads", "media");

const ensureMediaDir = async () => {
  await fs.mkdir(mediaRoot, { recursive: true });
};

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await ensureMediaDir();
      cb(null, mediaRoot);
    } catch (error) {
      cb(error as Error, mediaRoot);
    }
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || "").slice(0, 10);
    cb(null, `${timestamp}-${random}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.get("/", ...requireMediaManagement, async (_req, res, next) => {
  try {
    await ensureMediaDir();
    const files = await fs.readdir(mediaRoot);

    const entries = await Promise.all(
      files.map(async (filename) => {
        const fullPath = path.join(mediaRoot, filename);
        const stat = await fs.stat(fullPath);
        return {
          id: filename,
          filename,
          size: stat.size,
          createdAt: stat.birthtime?.toISOString?.() ?? stat.mtime.toISOString(),
          url: `/uploads/media/${encodeURIComponent(filename)}`,
        };
      }),
    );

    entries.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    res.json({ data: entries, total: entries.length });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/upload",
  ...requireMediaManagement,
  upload.single("file"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json({ error: "Missing file" });
      }

      const payload = {
        id: file.filename,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/media/${encodeURIComponent(file.filename)}`,
      };

      await logEvent({
        eventType: "MEDIA_UPLOADED",
        severity: "info",
        actorId: req.user?.sub,
        actorUsername: req.user?.username,
        actorRole: Array.isArray(req.user?.roles) ? req.user.roles[0] : undefined,
        entityType: "MEDIA",
        entityId: file.filename,
        payload: { originalName: file.originalname, mimeType: file.mimetype, size: file.size },
      });

      res.status(201).json({ data: payload });
    } catch (error) {
      next(error);
    }
  },
);

router.delete("/:id", ...requireMediaManagement, async (req: AuthenticatedRequest, res, next) => {
  try {
    await ensureMediaDir();
    const id = req.params.id;
    const candidate = path.resolve(mediaRoot, id);
    if (!candidate.startsWith(mediaRoot)) {
      return res.status(400).json({ error: "Invalid media id" });
    }

    try {
      await fs.unlink(candidate);
    } catch (error: any) {
      if (error?.code === "ENOENT") {
        return res.status(404).json({ error: "Media not found" });
      }
      throw error;
    }

    await logEvent({
      eventType: "MEDIA_DELETED",
      severity: "warning",
      actorId: req.user?.sub,
      actorUsername: req.user?.username,
      actorRole: Array.isArray(req.user?.roles) ? req.user.roles[0] : undefined,
      entityType: "MEDIA",
      entityId: id,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

