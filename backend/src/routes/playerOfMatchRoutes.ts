import { Router, Request, Response } from "express";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import * as playerOfMatchService from "../services/playerOfMatchService";

const router = Router();

/**
 * GET /api/player-of-match/:matchId
 * Get player of the match for a specific match
 */
router.get("/:matchId", async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.matchId, 10);
    const pom = await playerOfMatchService.getPlayerOfMatch(matchId);

    if (!pom) {
      return res.status(404).json({ error: "No player of the match for this match" });
    }

    res.json(pom);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch player of the match" });
  }
});

/**
 * GET /api/player-of-match/season/:seasonId
 * Get all player of the match awards for a season
 */
router.get("/season/:seasonId", async (req: Request, res: Response) => {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    const poms = await playerOfMatchService.getSeasonPlayerOfMatch(seasonId);
    res.json(poms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch player of the match awards" });
  }
});

/**
 * GET /api/player-of-match/season/:seasonId/top
 * Get top players by POM awards in a season
 */
router.get("/season/:seasonId/top", async (req: Request, res: Response) => {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const topPlayers = await playerOfMatchService.getTopPlayersInSeason(
      seasonId,
      limit
    );
    res.json(topPlayers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top players" });
  }
});

/**
 * GET /api/player-of-match/season/:seasonId/statistics
 * Get POM statistics for a season
 */
router.get(
  "/season/:seasonId/statistics",
  async (req: Request, res: Response) => {
    try {
      const seasonId = parseInt(req.params.seasonId, 10);
      const stats = await playerOfMatchService.getSeasonPomStatistics(seasonId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch POM statistics" });
    }
  }
);

/**
 * GET /api/player-of-match/player/:playerId
 * Get all player of the match awards for a specific player
 */
router.get("/player/:playerId", async (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const poms = await playerOfMatchService.getPlayerPomAwards(playerId);
    res.json(poms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch player awards" });
  }
});

/**
 * GET /api/player-of-match/team/:teamId
 * Get all player of the match awards for a specific team
 */
router.get("/team/:teamId", async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    const poms = await playerOfMatchService.getTeamPomAwards(teamId);
    res.json(poms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team awards" });
  }
});

/**
 * GET /api/player-of-match/match/:matchId/voting-results
 * Get fan voting results for a match
 */
router.get(
  "/match/:matchId/voting-results",
  async (req: Request, res: Response) => {
    try {
      const matchId = parseInt(req.params.matchId, 10);
      const results = await playerOfMatchService.getFanVotingResults(matchId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch voting results" });
    }
  }
);

/**
 * POST /api/player-of-match
 * Select player of the match
 */
router.post(
  "/",
  requireAuth,
  requirePermission("manage_player_of_match"),
  async (req: Request, res: Response) => {
    try {
      const { matchId, playerId, teamId, method, votesCount, rating } = req.body;

      if (!matchId || !playerId || !teamId || !method) {
        return res.status(400).json({
          error: "Missing required fields: matchId, playerId, teamId, method",
        });
      }

      const validMethods = ["referee", "team_captain", "fan_vote", "statistics"];
      if (!validMethods.includes(method)) {
        return res.status(400).json({ error: "Invalid selection method" });
      }

      // Check if already selected
      const exists = await playerOfMatchService.hasPlayerPomForMatch(
        matchId,
        playerId
      );
      if (exists) {
        return res.status(409).json({
          error: "Player of the match already selected for this match",
        });
      }

      const pom = await playerOfMatchService.selectPlayerOfMatch(
        parseInt(matchId, 10),
        parseInt(playerId, 10),
        parseInt(teamId, 10),
        method,
        votesCount ? parseInt(votesCount, 10) : undefined,
        rating ? parseFloat(rating) : undefined
      );

      res.status(201).json(pom);
    } catch (error) {
      res.status(500).json({ error: "Failed to select player of the match" });
    }
  }
);

/**
 * PUT /api/player-of-match/:pomId
 * Update player of the match selection
 */
router.put(
  "/:pomId",
  requireAuth,
  requirePermission("manage_player_of_match"),
  async (req: Request, res: Response) => {
    try {
      const pomId = parseInt(req.params.pomId, 10);
      const { method, votesCount, rating } = req.body;

      const updates: Record<string, any> = {};
      if (method !== undefined) updates.method = method;
      if (votesCount !== undefined) updates.votesCount = parseInt(votesCount, 10);
      if (rating !== undefined) updates.rating = parseFloat(rating);

      const pom = await playerOfMatchService.updatePlayerOfMatch(pomId, updates);

      if (!pom) {
        return res.status(404).json({ error: "Player of the match not found" });
      }

      res.json(pom);
    } catch (error) {
      res.status(500).json({ error: "Failed to update player of the match" });
    }
  }
);

/**
 * DELETE /api/player-of-match/:pomId
 * Delete player of the match selection
 */
router.delete(
  "/:pomId",
  requireAuth,
  requirePermission("manage_player_of_match"),
  async (req: Request, res: Response) => {
    try {
      const pomId = parseInt(req.params.pomId, 10);
      await playerOfMatchService.deletePlayerOfMatch(pomId);
      res.json({ message: "Player of the match selection removed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete player of the match" });
    }
  }
);

export default router;
