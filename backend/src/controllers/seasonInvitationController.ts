import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import * as invitationService from "../services/seasonInvitationService";
import * as eligibilityService from "../services/teamEligibilityService";
import { query } from "../db/sqlServer";

/**
 * GET /api/seasons/:seasonId/invitations
 * List all invitations for a season
 */
export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    if (isNaN(seasonId)) {
      res.status(400).json({ error: "Invalid season ID" });
      return;
    }

    const invitations = await invitationService.listSeasonInvitations(seasonId);
    res.json({ data: invitations });
  } catch (error) {
    res.status(500).json({ error: "Failed to list invitations" });
  }
}

/**
 * POST /api/seasons/:seasonId/invitations
 * Create a single invitation
 */
export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    if (isNaN(seasonId)) {
      res.status(400).json({ error: "Invalid season ID" });
      return;
    }

    const { teamId, inviteType, responseDeadline, previousSeasonRank } = req.body;

    if (!teamId || !inviteType || !responseDeadline) {
      res.status(400).json({ error: "Missing required fields: teamId, inviteType, responseDeadline" });
      return;
    }

    if (!["retained", "promoted", "replacement"].includes(inviteType)) {
      res.status(400).json({ error: "Invalid inviteType. Must be: retained, promoted, or replacement" });
      return;
    }

    const invitation = await invitationService.createInvitation({
      seasonId,
      teamId: parseInt(teamId, 10),
      inviteType,
      responseDeadline,
      invitedBy: req.user!.sub,
      previousSeasonRank: previousSeasonRank ? parseInt(previousSeasonRank, 10) : null,
    });

    res.status(201).json({ data: invitation });
  } catch (error: any) {
    if (error.name === "BadRequestError" || error.name === "NotFoundError") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to create invitation" });
  }
}

/**
 * POST /api/seasons/:seasonId/invitations/auto-create
 * Automatically create invitations based on previous season standings
 */
export async function autoCreate(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    if (isNaN(seasonId)) {
      res.status(400).json({ error: "Invalid season ID" });
      return;
    }

    const { previousSeasonId, responseDeadlineDays, promotedTeamIds } = req.body;

    if (!previousSeasonId) {
      res.status(400).json({ error: "previousSeasonId is required" });
      return;
    }

    const result = await invitationService.autoCreateInvitations({
      seasonId,
      previousSeasonId: parseInt(previousSeasonId, 10),
      invitedBy: req.user!.sub,
      responseDeadlineDays: responseDeadlineDays ? parseInt(responseDeadlineDays, 10) : undefined,
      promotedTeamIds: promotedTeamIds
        ? promotedTeamIds.map((id: string | number) => parseInt(String(id), 10))
        : undefined,
    });

    res.status(201).json({ data: result });
  } catch (error: any) {
    if (error.name === "BadRequestError" || error.name === "NotFoundError") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to auto-create invitations" });
  }
}

/**
 * GET /api/seasons/:seasonId/invitations/:invitationId/eligibility
 * Check team eligibility based on requirements
 */
export async function checkEligibility(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    const invitationId = parseInt(req.params.invitationId, 10);

    if (isNaN(seasonId) || isNaN(invitationId)) {
      res.status(400).json({ error: "Invalid season ID or invitation ID" });
      return;
    }

    // Get invitation to find teamId
    const invitations = await invitationService.listSeasonInvitations(seasonId);
    const invitation = invitations.find((inv) => inv.invitationId === invitationId);

    if (!invitation) {
      res.status(404).json({ error: "Invitation not found" });
      return;
    }

    // Get team data
    const teamData = await eligibilityService.getTeamEligibilityData(invitation.teamId, seasonId);

    // Check if governing body is in Vietnam
    const governingBodyInVietnam = await eligibilityService.checkGoverningBodyInVietnam(
      invitation.teamId,
      teamData.governingBody,
      teamData.country
    );

    // Check participation fee status (this would typically come from season_team_registrations)
    const feeStatusResult = await query<{ fee_status: string }>(
      `
      SELECT fee_status
      FROM season_team_registrations
      WHERE season_id = @seasonId AND team_id = @teamId
      `,
      { seasonId, teamId: invitation.teamId }
    );

    const feeStatus = feeStatusResult.recordset[0]?.fee_status || "unpaid";
    const participationFeePaid = feeStatus === "paid" || feeStatus === "waived";

    // Validate eligibility
    const eligibility = await eligibilityService.validateTeamEligibility({
      teamId: invitation.teamId,
      seasonId,
      participationFeePaid,
      governingBodyInVietnam,
      stadiumCapacity: teamData.stadiumCapacity,
      stadiumRating: teamData.stadiumRating,
      stadiumCity: teamData.stadiumCity,
      stadiumCountry: teamData.stadiumCountry,
    });

    res.json({ data: eligibility });
  } catch (error: any) {
    if (error.name === "BadRequestError" || error.name === "NotFoundError") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to check eligibility" });
  }
}

/**
 * PATCH /api/seasons/:seasonId/invitations/:invitationId/status
 * Update invitation status (accept/decline)
 */
export async function updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    const invitationId = parseInt(req.params.invitationId, 10);

    if (isNaN(seasonId) || isNaN(invitationId)) {
      res.status(400).json({ error: "Invalid season ID or invitation ID" });
      return;
    }

    const { status, responseNotes } = req.body;

    if (!status || !["accepted", "declined", "expired", "rescinded", "replaced"].includes(status)) {
      res.status(400).json({
        error: "Invalid status. Must be: accepted, declined, expired, rescinded, or replaced",
      });
      return;
    }

    await invitationService.updateInvitationStatus(
      invitationId,
      status as any,
      req.user!.sub,
      responseNotes
    );

    res.json({ message: "Invitation status updated successfully" });
  } catch (error: any) {
    if (error.name === "BadRequestError" || error.name === "NotFoundError") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update invitation status" });
  }
}

/**
 * GET /api/seasons/:seasonId/invitations/stats
 * Get invitation statistics (accepted count, pending, etc.)
 */
export async function getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    if (isNaN(seasonId)) {
      res.status(400).json({ error: "Invalid season ID" });
      return;
    }

    const acceptedCount = await invitationService.getAcceptedTeamsCount(seasonId);

    const statsResult = await query<{
      status: string;
      count: number;
    }>(
      `
      SELECT status, COUNT(*) AS count
      FROM season_invitations
      WHERE season_id = @seasonId
      GROUP BY status
      `,
      { seasonId }
    );

    const statsByStatus: Record<string, number> = {};
    statsResult.recordset.forEach((row) => {
      statsByStatus[row.status] = row.count;
    });

    res.json({
      data: {
        acceptedCount,
        totalPending: statsByStatus["pending"] ?? 0,
        totalDeclined: statsByStatus["declined"] ?? 0,
        totalExpired: statsByStatus["expired"] ?? 0,
        totalAccepted: statsByStatus["accepted"] ?? 0,
        totalReplaced: statsByStatus["replaced"] ?? 0,
        byStatus: statsByStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get invitation statistics" });
  }
}

/**
 * POST /api/seasons/:seasonId/invitations/:invitationId/create-replacement
 * Manually create a replacement invitation for a declined/expired invitation
 */
export async function createReplacement(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    const invitationId = parseInt(req.params.invitationId, 10);

    if (isNaN(seasonId) || isNaN(invitationId)) {
      res.status(400).json({ error: "Invalid season ID or invitation ID" });
      return;
    }

    const { previousSeasonId, replacementTeamId, responseDeadlineDays } = req.body;

    if (!previousSeasonId) {
      res.status(400).json({ error: "previousSeasonId is required" });
      return;
    }

    let replacementTeamIdToUse = replacementTeamId
      ? parseInt(String(replacementTeamId), 10)
      : null;

    // If not specified, automatically find replacement team
    if (!replacementTeamIdToUse) {
      const replacementTeam = await invitationService.findReplacementTeam(
        seasonId,
        parseInt(previousSeasonId, 10),
        invitationId
      );

      if (!replacementTeam) {
        res.status(404).json({
          error: "No available replacement team found from previous season",
        });
        return;
      }

      replacementTeamIdToUse = replacementTeam.teamId;
    }

    const replacement = await invitationService.createReplacementInvitation(
      seasonId,
      replacementTeamIdToUse,
      invitationId,
      req.user!.sub,
      responseDeadlineDays ? parseInt(responseDeadlineDays, 10) : undefined
    );

    res.status(201).json({ data: replacement });
  } catch (error: any) {
    if (error.name === "BadRequestError" || error.name === "NotFoundError") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to create replacement invitation" });
  }
}

/**
 * POST /api/seasons/:seasonId/invitations/ensure-minimum-teams
 * Automatically create replacement invitations to ensure minimum accepted teams
 */
export async function ensureMinimumTeams(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const seasonId = parseInt(req.params.seasonId, 10);
    if (isNaN(seasonId)) {
      res.status(400).json({ error: "Invalid season ID" });
      return;
    }

    const { previousSeasonId, minimumTeams, responseDeadlineDays } = req.body;

    if (!previousSeasonId) {
      res.status(400).json({ error: "previousSeasonId is required" });
      return;
    }

    const result = await invitationService.ensureMinimumAcceptedTeams(
      seasonId,
      parseInt(previousSeasonId, 10),
      minimumTeams ? parseInt(minimumTeams, 10) : 10,
      req.user!.sub,
      responseDeadlineDays ? parseInt(responseDeadlineDays, 10) : undefined
    );

    res.json({ data: result });
  } catch (error: any) {
    if (error.name === "BadRequestError" || error.name === "NotFoundError") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to ensure minimum teams" });
  }
}


