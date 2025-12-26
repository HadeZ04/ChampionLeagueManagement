import { Router } from "express";
import { z } from "zod";
import { requireAnyPermission, requireAuth } from "../middleware/authMiddleware";
import {
  calculateStandings,
  getStandingsForSeason,
  updateTeamStandings,
  resetTeamStandings,
  initializeStandingsForSeason,
  getTeamStandings,
} from "../services/standingsAdminService";
import { getSeasonStandings, StandingsMode } from "../services/standingsService_v2";

const router = Router();
const requireStandingsManagement = [requireAuth, requireAnyPermission("manage_matches", "manage_teams")] as const;

/**
 * GET /admin/standings/season/:seasonId
 * Get standings for a specific season
 * Query params:
 *   - mode: "live" (default) | "final" (with head-to-head tie-break)
 */
router.get("/season/:seasonId", ...requireStandingsManagement, async (req, res, next) => {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    if (isNaN(seasonId)) {
      return res.status(400).json({ error: "Invalid season ID" });
    }

    // Get mode from query params
    const mode = (req.query.mode as StandingsMode) || "live";
    
    // Validate mode
    if (mode !== "live" && mode !== "final") {
      return res.status(400).json({ 
        error: "Invalid mode. Must be 'live' or 'final'" 
      });
    }

    // Use new service with tie-break support
    const standings = await getSeasonStandings(seasonId, mode);
    
    res.json({ 
      data: standings,
      total: standings.length,
      mode: mode
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /admin/standings/team/:seasonTeamId
 * Get standings for a specific team
 */
router.get("/team/:seasonTeamId", ...requireStandingsManagement, async (req, res, next) => {
  try {
    const seasonTeamId = parseInt(req.params.seasonTeamId, 10);
    if (isNaN(seasonTeamId)) {
      return res.status(400).json({ error: "Invalid season team ID" });
    }

    const standing = await getTeamStandings(seasonTeamId);
    if (!standing) {
      return res.status(404).json({ error: "Team standings not found" });
    }

    res.json({ data: standing });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /admin/standings/season/:seasonId/initialize
 * Initialize standings for all teams in a season (create empty records)
 */
router.post("/season/:seasonId/initialize", ...requireStandingsManagement, async (req, res, next) => {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    if (isNaN(seasonId)) {
      return res.status(400).json({ error: "Invalid season ID" });
    }

    const count = await initializeStandingsForSeason(seasonId);
    res.json({
      success: true,
      message: `Initialized ${count} team standings records`,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /admin/standings/season/:seasonId/calculate
 * Calculate/recalculate standings from match results
 */
router.post("/season/:seasonId/calculate", ...requireStandingsManagement, async (req, res, next) => {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    if (isNaN(seasonId)) {
      return res.status(400).json({ error: "Invalid season ID" });
    }

    await calculateStandings(seasonId);
    const standings = await getStandingsForSeason(seasonId);

    res.json({
      success: true,
      message: "Standings calculated successfully",
      data: standings
    });
  } catch (error) {
    next(error);
  }
});

const updateStandingsSchema = z.object({
  wins: z.number().int().nonnegative().optional(),
  draws: z.number().int().nonnegative().optional(),
  losses: z.number().int().nonnegative().optional(),
  goalsFor: z.number().int().nonnegative().optional(),
  goalsAgainst: z.number().int().nonnegative().optional(),
  points: z.number().int().nonnegative().optional(),
});

/**
 * PATCH /admin/standings/team/:seasonTeamId
 * Manually update standings for a team (admin correction)
 */
router.patch("/team/:seasonTeamId", ...requireStandingsManagement, async (req, res, next) => {
  try {
    const seasonTeamId = parseInt(req.params.seasonTeamId, 10);
    if (isNaN(seasonTeamId)) {
      return res.status(400).json({ error: "Invalid season team ID" });
    }

    const updates = updateStandingsSchema.parse(req.body);
    
    await updateTeamStandings(seasonTeamId, updates);
    const updatedStanding = await getTeamStandings(seasonTeamId);

    res.json({
      success: true,
      message: "Team standings updated successfully",
      data: updatedStanding
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /admin/standings/team/:seasonTeamId
 * Reset standings for a team (set all to 0)
 */
router.delete("/team/:seasonTeamId", ...requireStandingsManagement, async (req, res, next) => {
  try {
    const seasonTeamId = parseInt(req.params.seasonTeamId, 10);
    if (isNaN(seasonTeamId)) {
      return res.status(400).json({ error: "Invalid season team ID" });
    }

    await resetTeamStandings(seasonTeamId);

    res.json({
      success: true,
      message: "Team standings reset successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;

