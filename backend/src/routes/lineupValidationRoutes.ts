import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import * as lineupValidationService from "../services/lineupValidationService";

const router = Router();

/**
 * POST /api/lineup/validate
 * Validate team lineup (check for max 3 foreign players, suspended players, etc.)
 */
router.post(
  "/validate",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { matchId, teamId, lineup } = req.body;

      if (!matchId || !teamId || !Array.isArray(lineup)) {
        return res.status(400).json({
          error: "Missing required fields: matchId, teamId, lineup (array)",
        });
      }

      const validation = await lineupValidationService.validateLineup(
        parseInt(matchId, 10),
        parseInt(teamId, 10),
        lineup
      );

      res.json(validation);
    } catch (error) {
      res.status(500).json({ error: "Failed to validate lineup" });
    }
  }
);

/**
 * GET /api/lineup/suspended/:matchId
 * Get list of suspended/banned players for a match
 */
router.get(
  "/suspended/:matchId",
  async (req: Request, res: Response) => {
    try {
      const matchId = parseInt(req.params.matchId, 10);
      const suspended = await lineupValidationService.getSuspendedPlayersForMatch(
        matchId
      );
      res.json(suspended);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suspended players" });
    }
  }
);

/**
 * GET /api/lineup/foreign-count/:matchId/:teamId
 * Get count of foreign players for team in match
 */
router.get(
  "/foreign-count/:matchId/:teamId",
  async (req: Request, res: Response) => {
    try {
      const matchId = parseInt(req.params.matchId, 10);
      const teamId = parseInt(req.params.teamId, 10);
      const { playerIds } = req.query;

      if (!playerIds) {
        return res.status(400).json({
          error: "Missing required query parameter: playerIds (comma-separated)",
        });
      }

      const playerIdArray = (playerIds as string)
        .split(",")
        .map((id) => parseInt(id, 10));

      const count = await lineupValidationService.getForeignPlayerCount(
        matchId,
        teamId,
        playerIdArray
      );

      res.json({
        foreign_count: count,
        max_allowed: 3,
        isValid: count <= 3,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to count foreign players" });
    }
  }
);

export default router;
