// src/controllers/seasonInvitationController.ts
import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import * as invitationService from "../services/seasonInvitationService";
import { query } from "../db/sqlServer";

/**
 * Helper: parse seasonId param
 */
function parseSeasonId(req: AuthenticatedRequest, res: Response): number | null {
  const seasonId = parseInt(req.params.seasonId, 10);
  if (isNaN(seasonId)) {
    res.status(400).json({ error: "Invalid season ID" });
    return null;
  }
  return seasonId;
}

/**
 * GET /api/seasons/:seasonId/invitations
 * BTC/SuperAdmin: list invitations of a season
 */
export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseSeasonId(req, res);
    if (!seasonId) return;

    const invitations = await invitationService.getSeasonInvitations(seasonId);

    // Transform to match FE format (đúng như bạn đang dùng)
    const transformed = invitations.map((inv) => ({
      invitationId: inv.invitation_id,
      seasonId: inv.season_id,
      teamId: inv.team_id,
      teamName: inv.team_name,
      shortName: null,
      inviteType: inv.invite_type, // retained | promoted | replacement
      status: inv.status, // pending | accepted | rejected | expired
      invitedAt: inv.invited_at,
      responseDeadline: inv.response_deadline,
      respondedAt: inv.responded_at,
      responseNotes: inv.response_notes,
      replacementForId: inv.replacement_for_id,
    }));

    res.json({ data: transformed });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to list invitations" });
  }
}

/**
 * POST /api/seasons/:seasonId/invitations/auto-create
 * BTC/SuperAdmin: create initial invitations from season_team_participants (Plan A)
 * Body: (none)
 */
export async function autoCreate(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseSeasonId(req, res);
    if (!seasonId) return;

    const userId = req.user!.sub;
    await invitationService.createSeasonInvitations(seasonId, userId);

    res.status(201).json({ data: { message: "Invitations created successfully" } });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to auto-create invitations" });
  }
}

/**
 * POST /api/seasons/:seasonId/invitations/auto-fill
 * BTC/SuperAdmin: ensure pending+accepted reaches 10 by adding replacement invitations
 */
export async function autoFill(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseSeasonId(req, res);
    if (!seasonId) return;

    const userId = req.user!.sub;
    const result = await invitationService.sendReplacementInvitations(seasonId, userId);

    res.status(200).json({
      data: {
        message: "Auto fill completed",
        created: result.created,
        neededBefore: result.neededBefore,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to auto-fill invitations" });
  }
}

/**
 * POST /api/seasons/invitations/mark-expired
 * BTC/SuperAdmin: mark expired invitations globally, then auto-fill affected seasons
 */
export async function markExpired(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.sub;

    const affectedSeasonIds = await invitationService.markExpiredInvitations();

    let totalCreated = 0;
    for (const seasonId of affectedSeasonIds) {
      const r = await invitationService.sendReplacementInvitations(seasonId, userId);
      totalCreated += r.created;
    }

    res.status(200).json({
      data: {
        message: "Expired invitations marked and auto-fill executed",
        affectedSeasons: affectedSeasonIds,
        totalCreated,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to mark expired invitations" });
  }
}

/**
 * PATCH /api/seasons/:seasonId/invitations/:invitationId/status
 * BTC/SuperAdmin override (khẩn cấp)
 * Accepts: accepted | rejected | declined
 * - declined (FE) => rejected (DB)
 */
export async function updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseSeasonId(req, res);
    if (!seasonId) return;

    const invitationId = parseInt(req.params.invitationId, 10);
    if (isNaN(invitationId)) {
      res.status(400).json({ error: "Invalid invitation ID" });
      return;
    }

    const { status, responseNotes } = req.body as {
      status: "accepted" | "rejected" | "declined" | "rescinded";
      responseNotes?: string;
    };

    if (!status || !["accepted", "rejected", "declined", "rescinded"].includes(status)) {
      res.status(400).json({
        error: "Invalid status. Use 'accepted', 'declined' or 'rescinded'.",
      });
      return;
    }

    const userId = req.user!.sub;

    if (status === "accepted") {
      await invitationService.acceptInvitation(invitationId, userId, responseNotes);
    } else if (status === "rescinded") {
      await invitationService.rescindInvitation(invitationId, userId, responseNotes);
    } else {
      // declined/rejected => declined (handled by service)
      await invitationService.rejectInvitation(invitationId, userId, responseNotes);
    }

    res.json({ message: "Invitation status updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update invitation status" });
  }
}

/**
 * POST /api/seasons/:seasonId/invitations/:invitationId/reinvite
 * BTC/SuperAdmin: re-invite a team (creates new invitation)
 */
export async function reinvite(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseSeasonId(req, res);
    if (!seasonId) return;

    const invitationId = parseInt(req.params.invitationId, 10);
    if (isNaN(invitationId)) {
      res.status(400).json({ error: "Invalid invitation ID" });
      return;
    }

    const userId = req.user!.sub;
    const inv = await invitationService.reinviteTeam(seasonId, invitationId, userId);

    res.status(200).json({ message: "Team re-invited successfully", data: inv });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to re-invite team" });
  }
}

/**
 * GET /api/seasons/:seasonId/invitations/stats
 * BTC/SuperAdmin: stats for UI cards
 */
export async function getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseSeasonId(req, res);
    if (!seasonId) return;

    // Summary by status (pending/accepted/rejected/expired)
    const summary = await invitationService.getInvitationsSummary(seasonId);

    // acceptedCount for FE (số đội accepted)
    const acceptedCount = summary.accepted ?? 0;

    // totalReplaced: đếm số invitation thuộc invite_type = 'replacement'
    const replacedRs = await query<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM season_invitations
      WHERE season_id = @seasonId
        AND invite_type = 'replacement'
      `,
      { seasonId }
    );
    const totalReplaced = replacedRs.recordset[0]?.count ?? 0;

    res.json({
      data: {
        acceptedCount,
        totalPending: summary.pending ?? 0,
        totalDeclined: summary.rejected ?? 0,
        totalRescinded: summary.rescinded ?? 0,
        totalExpired: summary.expired ?? 0,
        totalReplaced,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get invitation statistics" });
  }
}

/**
 * Optional stubs (giữ để FE không vỡ nếu đang gọi nhầm)
 */
export async function create(_req: AuthenticatedRequest, res: Response): Promise<void> {
  res.status(501).json({ error: "Not implemented. Use auto-create/auto-fill." });
}

export async function checkEligibility(_req: AuthenticatedRequest, res: Response): Promise<void> {
  res.status(501).json({ error: "Not implemented in Plan A." });
}

export async function createReplacement(_req: AuthenticatedRequest, res: Response): Promise<void> {
  res.status(501).json({ error: "Not implemented. Use auto-fill." });
}

export async function ensureMinimumTeams(_req: AuthenticatedRequest, res: Response): Promise<void> {
  res.status(501).json({ error: "Not implemented. Use auto-fill." });
}



