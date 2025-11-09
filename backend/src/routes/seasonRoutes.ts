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

const router = Router();
const requireSeasonManagement = requireAnyPermission("manage_rulesets", "manage_teams");

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

router.get(
  "/",
  requireAuth,
  requireSeasonManagement,
  async (_req, res) => {
    const seasons = await listSeasons();
    res.json(seasons);
  }
);

router.get(
  "/metadata",
  requireAuth,
  requireSeasonManagement,
  async (_req, res) => {
    const metadata = await listSeasonMetadata();
    res.json(metadata);
  }
);

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
