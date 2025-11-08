import { Router } from "express";
import { z } from "zod";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import { query } from "../db/sqlServer";
import { validate } from "../middleware/validate";

const router = Router();

const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  severity: z.enum(["info", "warning", "critical"]).optional(),
  eventType: z.string().min(1).max(100).optional(),
  entityType: z.string().min(1).max(100).optional(),
  actor: z.string().min(1).max(150).optional(),
  search: z.string().min(1).max(200).optional(),
  from: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Invalid from date",
    }),
  to: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Invalid to date",
    }),
});

router.get(
  "/",
  requireAuth,
  requirePermission("view_audit_logs"),
  validate({ schema: auditQuerySchema, target: "query" }),
  async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 50);
    const offset = (page - 1) * pageSize;

    const filters: string[] = [];
    const params: Record<string, unknown> = {
      offset,
      pageSize,
    };

    if (req.query.severity) {
      filters.push("LOWER(severity) = @severity");
      params.severity = String(req.query.severity).toLowerCase();
    }

    if (req.query.eventType) {
      filters.push("LOWER(event_type) = @eventType");
      params.eventType = String(req.query.eventType).toLowerCase();
    }

    if (req.query.entityType) {
      filters.push("LOWER(entity_type) = @entityType");
      params.entityType = String(req.query.entityType).toLowerCase();
    }

    if (req.query.actor) {
      filters.push("LOWER(actor_username) = @actorUsername");
      params.actorUsername = String(req.query.actor).toLowerCase();
    }

    if (req.query.from) {
      filters.push("created_at >= @fromDate");
      params.fromDate = new Date(String(req.query.from));
    }

    if (req.query.to) {
      filters.push("created_at <= @toDate");
      params.toDate = new Date(String(req.query.to));
    }

    if (req.query.search) {
      const like = `%${String(req.query.search).toLowerCase()}%`;
      params.search = like;
      filters.push(
        `(LOWER(event_type) LIKE @search
          OR LOWER(actor_username) LIKE @search
          OR LOWER(entity_type) LIKE @search
          OR LOWER(entity_id) LIKE @search)`
      );
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await query(
      `SELECT
        audit_event_id,
        event_type,
        severity,
        actor_username,
        actor_role,
        entity_type,
        entity_id,
        payload,
        metadata,
        created_at
      FROM audit_events
      ${whereClause}
      ORDER BY created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

      SELECT COUNT(*) AS total
      FROM audit_events
      ${whereClause};`,
      params
    );

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const rows = recordsets[0] ?? result.recordset ?? [];
    const total = (recordsets[1]?.[0] as { total?: number } | undefined)?.total ?? 0;

    res.json({
      data: rows,
      total,
      page,
      pageSize,
    });
  }
);

export default router;
