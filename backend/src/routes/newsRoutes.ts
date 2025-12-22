import { Router } from "express";
import { z } from "zod";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import { logEvent } from "../services/auditService";
import {
  createNews,
  deleteNews,
  getNewsById,
  listNews,
  listNewsCategories,
  updateNews,
} from "../services/newsService";
import { AuthenticatedRequest } from "../types";

const router = Router();
const requireContentManagement = [requireAuth, requirePermission("manage_content")] as const;

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

router.get("/", ...requireContentManagement, async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await listNews(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/categories", ...requireContentManagement, async (_req, res, next) => {
  try {
    const categories = await listNewsCategories();
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", ...requireContentManagement, async (req, res, next) => {
  try {
    const article = await getNewsById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: "News article not found" });
    }
    res.json({ data: article });
  } catch (error) {
    next(error);
  }
});

const createSchema = z.object({
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().min(10).max(2000),
  category: z.string().trim().min(2).max(50),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  author: z.string().trim().min(2).max(100),
  publishDate: z.string().trim().optional().nullable(),
  featured: z.boolean().optional(),
});

router.post("/", ...requireContentManagement, async (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = createSchema.parse(req.body ?? {});
    const created = await createNews(payload);

    await logEvent({
      eventType: "NEWS_CREATED",
      severity: "info",
      actorId: req.user?.sub,
      actorUsername: req.user?.username,
      actorRole: Array.isArray(req.user?.roles) ? req.user.roles[0] : undefined,
      entityType: "NEWS",
      entityId: created.id,
      payload: { title: created.title, status: created.status, category: created.category },
    });

    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

const updateSchema = createSchema.partial().extend({
  views: z.coerce.number().int().nonnegative().optional(),
});

router.put("/:id", ...requireContentManagement, async (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = updateSchema.parse(req.body ?? {});
    const updated = await updateNews(req.params.id, payload as any);
    if (!updated) {
      return res.status(404).json({ error: "News article not found" });
    }

    await logEvent({
      eventType: "NEWS_UPDATED",
      severity: "info",
      actorId: req.user?.sub,
      actorUsername: req.user?.username,
      actorRole: Array.isArray(req.user?.roles) ? req.user.roles[0] : undefined,
      entityType: "NEWS",
      entityId: updated.id,
      payload: { title: updated.title, status: updated.status, category: updated.category },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", ...requireContentManagement, async (req: AuthenticatedRequest, res, next) => {
  try {
    const deleted = await deleteNews(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "News article not found" });
    }

    await logEvent({
      eventType: "NEWS_DELETED",
      severity: "warning",
      actorId: req.user?.sub,
      actorUsername: req.user?.username,
      actorRole: Array.isArray(req.user?.roles) ? req.user.roles[0] : undefined,
      entityType: "NEWS",
      entityId: req.params.id,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

