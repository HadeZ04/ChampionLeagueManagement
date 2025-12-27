import { Router, Request, Response } from "express";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import * as matchReportService from "../services/matchReportService";

const router = Router();

/**
 * GET /api/match-reports/:matchId
 * Get report for a specific match
 */
router.get("/:matchId", async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.matchId, 10);
    const report = await matchReportService.getMatchReport(matchId);

    if (!report) {
      return res.status(404).json({ error: "Report not found for this match" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch match report" });
  }
});

/**
 * GET /api/match-reports/official/:officialId
 * Get all reports submitted by an official
 */
router.get("/official/:officialId", async (req: Request, res: Response) => {
  try {
    const officialId = parseInt(req.params.officialId, 10);
    const reports = await matchReportService.getReportsByOfficial(officialId);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch official reports" });
  }
});

/**
 * GET /api/match-reports/season/:seasonId/incidents
 * Get incidents summary for a season
 */
router.get("/season/:seasonId/incidents", async (req: Request, res: Response) => {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    const incidents = await matchReportService.getSeasonIncidents(seasonId);
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

/**
 * GET /api/match-reports/season/:seasonId/injuries
 * Get injury reports for a season
 */
router.get("/season/:seasonId/injuries", async (req: Request, res: Response) => {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    const injuries = await matchReportService.getSeasonInjuries(seasonId);
    res.json(injuries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch injuries" });
  }
});

/**
 * POST /api/match-reports
 * Create a new match report (Referee/Official only)
 */
router.post(
  "/",
  requireAuth,
  requirePermission("submit_match_reports"),
  async (req: Request, res: Response) => {
    try {
      const {
        matchId,
        attendance,
        weather_condition,
        match_summary,
        incidents,
        injuries_reported,
        referee_notes,
      } = req.body;

      if (!matchId) {
        return res.status(400).json({ error: "Match ID is required" });
      }

      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const report = await matchReportService.createMatchReport(
        parseInt(matchId, 10),
        userId,
        {
          attendance: attendance ? parseInt(attendance, 10) : undefined,
          weather_condition,
          match_summary,
          incidents,
          injuries_reported,
          referee_notes,
        }
      );

      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to create match report" });
    }
  }
);

/**
 * PUT /api/match-reports/:reportId
 * Update match report
 */
router.put(
  "/:reportId",
  requireAuth,
  requirePermission("submit_match_reports"),
  async (req: Request, res: Response) => {
    try {
      const reportId = parseInt(req.params.reportId, 10);
      const updates = {
        ...req.body,
        attendance: req.body.attendance
          ? parseInt(req.body.attendance, 10)
          : undefined,
      };

      const report = await matchReportService.updateMatchReport(
        reportId,
        updates
      );

      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to update match report" });
    }
  }
);

/**
 * DELETE /api/match-reports/:reportId
 * Delete match report (Admin only)
 */
router.delete(
  "/:reportId",
  requireAuth,
  requirePermission("manage_match_reports"),
  async (req: Request, res: Response) => {
    try {
      const reportId = parseInt(req.params.reportId, 10);
      await matchReportService.deleteMatchReport(reportId);
      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete match report" });
    }
  }
);

export default router;
