import { Router } from "express";
import { z } from "zod";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
  assignRulesetToSeason,
  createRuleset,
  deleteRuleset,
  getRuleset,
  listRulesets,
  publishRuleset,
  updateRuleset,
  upsertPlayerConstraints,
  upsertRankingRules,
  upsertScoringRules,
} from "../services/rulesetService";
import { AuthenticatedRequest } from "../types";

const router = Router();

router.get("/", requireAuth, requirePermission("manage_rulesets"), async (_req, res) => {
  const rulesets = await listRulesets();
  res.json(rulesets);
});

router.get(
  "/:id",
  requireAuth,
  requirePermission("manage_rulesets"),
  async (req, res) => {
    const ruleset = await getRuleset(Number(req.params.id));
    res.json(ruleset);
  }
);

const rulesetSchema = z.object({
  name: z.string().min(3),
  versionTag: z.string().min(2),
  description: z.string().optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
});

router.post(
  "/",
  requireAuth,
  requirePermission("manage_rulesets"),
  validate({ schema: rulesetSchema }),
  async (req: AuthenticatedRequest, res) => {
    const rulesetId = await createRuleset({
      ...req.body,
      actorId: req.user!.sub,
      actorUsername: req.user!.username,
    });
    res.status(201).json({ rulesetId });
  }
);

router.put(
  "/:id",
  requireAuth,
  requirePermission("manage_rulesets"),
  validate({ schema: rulesetSchema.partial() }),
  async (req: AuthenticatedRequest, res) => {
    const ruleset = await updateRuleset(Number(req.params.id), {
      ...req.body,
      actorId: req.user!.sub,
      actorUsername: req.user!.username,
    });
    res.json(ruleset);
  }
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("manage_rulesets"),
  async (req: AuthenticatedRequest, res) => {
    await deleteRuleset(Number(req.params.id), req.user!.sub, req.user!.username);
    res.status(204).send();
  }
);

router.post(
  "/:id/publish",
  requireAuth,
  requirePermission("manage_rulesets"),
  async (req: AuthenticatedRequest, res) => {
    await publishRuleset(Number(req.params.id), req.user!.sub, req.user!.username);
    res.status(204).send();
  }
);

const constraintsSchema = z.object({
  minAge: z.number().int().min(12),
  maxAge: z.number().int().max(60),
  maxPlayers: z.number().int().min(11).max(40),
  maxForeignPlayers: z.number().int().min(0),
  squadDeadline: z.string().optional(),
});

router.put(
  "/:id/player-constraints",
  requireAuth,
  requirePermission("manage_rulesets"),
  validate({ schema: constraintsSchema }),
  async (req, res) => {
    await upsertPlayerConstraints(Number(req.params.id), req.body);
    res.status(204).send();
  }
);

const scoringSchema = z.object({
  maxGoalTime: z.number().int().min(30).max(150),
  acceptedGoalTypes: z.array(z.string()).min(1),
});

router.put(
  "/:id/scoring-rules",
  requireAuth,
  requirePermission("manage_rulesets"),
  validate({ schema: scoringSchema }),
  async (req, res) => {
    await upsertScoringRules(Number(req.params.id), req.body);
    res.status(204).send();
  }
);

const rankingSchema = z.object({
  pointsForWin: z.number().int().min(0),
  pointsForDraw: z.number().int().min(0),
  pointsForLoss: z.number().int(),
  tieBreakingOrder: z.array(z.string()).min(1),
});

router.put(
  "/:id/ranking-rules",
  requireAuth,
  requirePermission("manage_rulesets"),
  validate({ schema: rankingSchema }),
  async (req, res) => {
    await upsertRankingRules(Number(req.params.id), req.body);
    res.status(204).send();
  }
);

const assignmentSchema = z.object({
  rulesetId: z.number().int().positive(),
});

router.post(
  "/seasons/:seasonId/assign",
  requireAuth,
  requirePermission("manage_rulesets"),
  validate({ schema: assignmentSchema }),
  async (req: AuthenticatedRequest, res) => {
    await assignRulesetToSeason(Number(req.params.seasonId), req.body.rulesetId, req.user!.sub);
    res.status(204).send();
  }
);

export default router;
