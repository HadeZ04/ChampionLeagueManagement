import { Router } from "express";
import { z } from "zod";
import { requireAnyPermission, requireAuth } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
  createSeason,
  deleteSeason,
  getSeasonById,
  listSeasonMetadata,
  listSeasons,
  updateSeason,
} from "../services/seasonService";
import { AuthenticatedRequest } from "../types";
import { query } from "../db/sqlServer";

const router = Router();
const requireSeasonManagement = requireAnyPermission("manage_rulesets", "manage_teams");

/* ===================== SCHEMAS ===================== */

const seasonStatusSchema = z.union([
  z.literal("draft"),
  z.literal("inviting"),
  z.literal("registering"),
  z.literal("scheduled"),
  z.literal("in_progress"),
  z.literal("completed"),
  z.literal("archived"),
]);

const seasonBaseSchema = z.object({
  tournamentId: z.number().int().positive(),
  rulesetId: z.number().int().positive(),
  name: z.string().min(3),
  code: z.string().min(2),
  status: seasonStatusSchema,
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  participationFee: z.number().min(0).optional(),
  invitationOpenedAt: z.string().optional().nullable(),
  registrationDeadline: z.string().optional().nullable(),
  maxTeams: z.number().int().min(1).max(64).optional(),
  expectedRounds: z.number().int().min(1).max(60).optional(),
});

/* ===================== ROUTES ===================== */

/**
 * GET /api/seasons/:id/teams
 * 👉 FE dropdown chọn đội
 */
router.get(
  "/:id/teams",
  requireAuth,
  async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')

    const seasonId = Number(req.params.id)

    const result = await query(`
      SELECT
        stp.season_team_id,
        stp.season_id,
        t.team_id,
        t.name AS team_name
      FROM season_team_participants stp
      JOIN teams t ON stp.team_id = t.team_id
      WHERE stp.season_id = @seasonId
      ORDER BY t.name
    `, { seasonId })

    res.json(
      result.recordset.map(r => ({
        id: r.season_team_id,
        name: r.team_name,
        team_id: r.team_id
      }))
    )
  }
)


/**
 * GET /api/seasons
 */
router.get(
  "/",
  requireAuth,
  requireAuth,
  // Allow all authenticated users to list seasons (needed for Team Admin My Team page)
  async (_req, res) => {
    const seasons = await listSeasons();
    res.json(seasons);
  }
);

/**
 * GET /api/seasons/metadata
 */
router.get(
  "/metadata",
  requireAuth,
  requireSeasonManagement,
  async (_req, res) => {
    const metadata = await listSeasonMetadata();
    res.json(metadata);
  }
);

/**
 * GET /api/seasons/:id
 */
router.get(
  "/:id",
  requireAuth,
  requireSeasonManagement,
  async (req, res) => {
    const season = await getSeasonById(Number(req.params.id));
    if (!season) {
      return res.status(404).json({ error: "Season not found" });
    }
    res.json(season);
  }
);

/**
 * POST /api/seasons
 */
router.post(
  "/",
  requireAuth,
  requireSeasonManagement,
  validate({ schema: seasonBaseSchema }),
  async (req: AuthenticatedRequest, res) => {
    const season = await createSeason({
      ...req.body,
      endDate: req.body.endDate || null,
      description: req.body.description || null,
      participationFee: req.body.participationFee ?? 0,
      invitationOpenedAt: req.body.invitationOpenedAt || null,
      registrationDeadline: req.body.registrationDeadline || null,
      actorId: req.user!.sub,
    });
    res.status(201).json(season);
  }
);

/**
 * PUT /api/seasons/:id
 */
router.put(
  "/:id",
  requireAuth,
  requireSeasonManagement,
  validate({ schema: seasonBaseSchema }),
  async (req: AuthenticatedRequest, res) => {
    const seasonId = Number(req.params.id);
    const season = await updateSeason(seasonId, {
      ...req.body,
      endDate: req.body.endDate || null,
      description: req.body.description || null,
      participationFee: req.body.participationFee ?? 0,
      invitationOpenedAt: req.body.invitationOpenedAt || null,
      registrationDeadline: req.body.registrationDeadline || null,
      actorId: req.user!.sub,
    });
    res.json(season);
  }
);

/**
 * DELETE /api/seasons/:id
 */
router.delete(
  "/:id",
  requireAuth,
  requireSeasonManagement,
  async (req, res) => {
    const seasonId = Number(req.params.id);
    if (Number.isNaN(seasonId)) {
      return res.status(400).json({ error: "Invalid season id" });
    }
    const deleted = await deleteSeason(seasonId);
    if (!deleted) {
      return res.status(404).json({ error: "Season not found" });
    }
    res.status(204).send();
  }
);

export default router;

