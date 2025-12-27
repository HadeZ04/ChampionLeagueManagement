import { Router, Request, Response } from "express";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import * as seasonInvitationService from "../services/seasonInvitationService";

const router = Router();

/**
 * GET /api/season-invitations/season/:seasonId
 * Get all invitations for a season (Admin only)
 */
router.get(
  "/season/:seasonId",
  requireAuth,
  requirePermission("manage_season_invitations"),
  async (req: Request, res: Response) => {
    try {
      const seasonId = parseInt(req.params.seasonId, 10);
      const invitations =
        await seasonInvitationService.getSeasonInvitations(seasonId);
      res.json(invitations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invitations" });
    }
  }
);

/**
 * GET /api/season-invitations/team/:teamId
 * Get pending invitations for a team
 */
router.get(
  "/team/:teamId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.teamId, 10);
      const invitations =
        await seasonInvitationService.getPendingInvitationsForTeam(teamId);
      res.json(invitations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending invitations" });
    }
  }
);

/**
 * GET /api/season-invitations/summary/:seasonId
 * Get invitations summary for a season
 */
router.get(
  "/summary/:seasonId",
  requireAuth,
  requirePermission("view_season_statistics"),
  async (req: Request, res: Response) => {
    try {
      const seasonId = parseInt(req.params.seasonId, 10);
      const summary =
        await seasonInvitationService.getInvitationsSummary(seasonId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invitations summary" });
    }
  }
);

/**
 * GET /api/season-invitations/:invitationId
 * Get invitation details
 */
router.get(
  "/:invitationId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const invitationId = parseInt(req.params.invitationId, 10);
      const invitation =
        await seasonInvitationService.getInvitationDetails(invitationId);

      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }

      res.json(invitation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invitation details" });
    }
  }
);

/**
 * POST /api/season-invitations/send
 * Send invitations for a season (Auto-invite 14 previous + 2 promoted teams)
 */
router.post(
  "/send",
  requireAuth,
  requirePermission("manage_season_invitations"),
  async (req: Request, res: Response) => {
    try {
      const { seasonId } = req.body;

      if (!seasonId) {
        return res.status(400).json({ error: "Season ID is required" });
      }

      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      await seasonInvitationService.createSeasonInvitations(seasonId, userId);
      res.json({
        message: "Invitations sent successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send invitations" });
    }
  }
);

/**
 * POST /api/season-invitations/:invitationId/accept
 * Accept an invitation
 */
router.post(
  "/:invitationId/accept",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const invitationId = parseInt(req.params.invitationId, 10);
      const { notes } = req.body;

      await seasonInvitationService.acceptInvitation(invitationId, notes);
      res.json({ message: "Invitation accepted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  }
);

/**
 * POST /api/season-invitations/:invitationId/reject
 * Reject an invitation
 */
router.post(
  "/:invitationId/reject",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const invitationId = parseInt(req.params.invitationId, 10);
      const { notes } = req.body;

      await seasonInvitationService.rejectInvitation(invitationId, notes);
      res.json({ message: "Invitation rejected successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject invitation" });
    }
  }
);

/**
 * POST /api/season-invitations/expire/check
 * Mark expired invitations (Admin task - can be run via cron)
 */
router.post(
  "/expire/check",
  requireAuth,
  requirePermission("manage_season_invitations"),
  async (req: Request, res: Response) => {
    try {
      await seasonInvitationService.markExpiredInvitations();
      res.json({ message: "Expired invitations marked" });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark expired invitations" });
    }
  }
);

export default router;
