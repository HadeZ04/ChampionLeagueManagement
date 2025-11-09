import { Router } from "express";
import {
  syncAllData,
  syncTeamsOnly,
  syncPlayersOnly,
  syncMatchesOnly,
  syncStandingsOnly,
} from "../services/syncService";

const router = Router();

/**
 * POST /sync - Sync all data from Football-Data.org API to database
 * Body: {
 *   season?: string,
 *   syncTeams?: boolean,
 *   syncPlayers?: boolean,
 *   syncMatches?: boolean,
 *   syncStandings?: boolean,
 *   matchStatus?: string,
 *   matchDateFrom?: string,
 *   matchDateTo?: string
 * }
 */
router.post("/", async (req, res, next) => {
  try {
    const {
      season,
      syncTeams = true,
      syncPlayers = true,
      syncMatches = true,
      syncStandings = true,
      matchStatus,
      matchDateFrom,
      matchDateTo,
    } = req.body;

    const result = await syncAllData({
      season,
      syncTeams,
      syncPlayers,
      syncMatches,
      syncStandings,
      matchStatus,
      matchDateFrom,
      matchDateTo,
    });

    if (result.success) {
      res.json({
        success: true,
        message: "Data synced successfully",
        data: result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Some sync operations failed",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /sync/teams - Sync only teams
 */
router.post("/teams", async (req, res, next) => {
  try {
    const { season } = req.body;
    const result = await syncTeamsOnly(season);

    if (result.success) {
      res.json({
        success: true,
        message: "Teams synced successfully",
        data: result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Teams sync failed",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /sync/players - Sync only players
 */
router.post("/players", async (req, res, next) => {
  try {
    const { season } = req.body;
    const result = await syncPlayersOnly(season);

    if (result.success) {
      res.json({
        success: true,
        message: "Players synced successfully",
        data: result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Players sync failed",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /sync/matches - Sync only matches
 */
router.post("/matches", async (req, res, next) => {
  try {
    const { season, status, dateFrom, dateTo } = req.body;
    const result = await syncMatchesOnly(season, status, dateFrom, dateTo);

    if (result.success) {
      res.json({
        success: true,
        message: "Matches synced successfully",
        data: result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Matches sync failed",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /sync/standings - Sync only standings
 */
router.post("/standings", async (req, res, next) => {
  try {
    const { season } = req.body;
    const result = await syncStandingsOnly(season);

    if (result.success) {
      res.json({
        success: true,
        message: "Standings synced successfully",
        data: result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Standings sync failed",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

