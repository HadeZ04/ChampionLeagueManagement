import { query, transaction, SqlTransaction } from "../db/sqlServer";
import { BadRequestError, NotFoundError } from "../utils/httpError";
import sql from "mssql";
import { sendTeamInvitationEmail, TeamInvitationEmailData } from "./emailService";
import * as eligibilityService from "./teamEligibilityService";
import { REQUIREMENTS } from "./teamEligibilityService";

export interface TeamInvitationSummary {
  invitationId: number;
  teamId: number;
  teamName: string;
  shortName: string | null;
  inviteType: "retained" | "promoted" | "replacement";
  status: "pending" | "accepted" | "declined" | "expired" | "rescinded" | "replaced";
  invitedAt: string;
  responseDeadline: string;
  respondedAt: string | null;
  previousSeasonRank?: number | null;
}

export interface CreateInvitationInput {
  seasonId: number;
  teamId: number;
  inviteType: "retained" | "promoted" | "replacement";
  responseDeadline: string; // ISO date string
  invitedBy: number;
  previousSeasonRank?: number | null;
}

export interface AutoCreateInvitationsInput {
  seasonId: number;
  previousSeasonId: number;
  invitedBy: number;
  responseDeadlineDays?: number; // Default 14 days
  promotedTeamIds?: number[]; // Optional: manually specify promoted teams if not available in standings
}

/**
 * Get top N teams from a previous season based on standings
 */
export async function getTopTeamsFromSeason(
  seasonId: number,
  count: number
): Promise<Array<{ teamId: number; teamName: string; rank: number; points: number }>> {
  const result = await query<{
    team_id: number;
    team_name: string;
    rank: number;
    points: number;
  }>(
    `
    SELECT TOP (@count)
      t.team_id,
      t.name AS team_name,
      ROW_NUMBER() OVER (ORDER BY sts.points DESC, sts.goal_difference DESC, sts.goals_for DESC) AS rank,
      sts.points
    FROM season_team_statistics sts
    INNER JOIN season_team_participants stp ON sts.season_team_id = stp.season_team_id
    INNER JOIN teams t ON stp.team_id = t.team_id
    WHERE sts.season_id = @seasonId
      AND stp.status = 'active'
    ORDER BY sts.points DESC, sts.goal_difference DESC, sts.goals_for DESC
    `,
    { seasonId, count }
  );

  return result.recordset.map((row) => ({
    teamId: row.team_id,
    teamName: row.team_name,
    rank: row.rank,
    points: row.points,
  }));
}

/**
 * Get team contact email addresses (from team admins)
 */
async function getTeamContactEmails(teamId: number): Promise<string[]> {
  try {
    const result = await query<{ email: string }>(
      `
      SELECT DISTINCT ua.email
      FROM user_team_assignments uta
      INNER JOIN user_accounts ua ON uta.user_id = ua.user_id
      WHERE uta.team_id = @teamId
        AND ua.email IS NOT NULL
        AND ua.email != ''
      `,
      { teamId }
    );

    return result.recordset.map((row) => row.email);
  } catch (error) {
    console.warn(`Failed to get contact emails for team ${teamId}:`, error);
    return [];
  }
}

/**
 * Get season name
 */
async function getSeasonName(seasonId: number): Promise<string> {
  const result = await query<{ name: string }>(
    `SELECT name FROM seasons WHERE season_id = @seasonId`,
    { seasonId }
  );

  return result.recordset[0]?.name || `Mùa giải ${seasonId}`;
}

/**
 * Send invitation email to team (non-blocking)
 */
async function sendInvitationEmailAsync(
  teamId: number,
  teamName: string,
  seasonId: number,
  invitationId: number,
  responseDeadline: string
): Promise<void> {
  try {
    const emails = await getTeamContactEmails(teamId);
    if (emails.length === 0) {
      console.warn(`No email addresses found for team ${teamId}. Email not sent.`);
      return;
    }

    const seasonName = await getSeasonName(seasonId);

    const emailData: TeamInvitationEmailData = {
      teamName,
      seasonName,
      responseDeadline,
      invitationId,
      regulations: {
        participationFee: REQUIREMENTS.PARTICIPATION_FEE_VND,
        minPlayers: REQUIREMENTS.MIN_PLAYERS,
        maxPlayers: REQUIREMENTS.MAX_PLAYERS,
        maxForeignPlayersRegistration: REQUIREMENTS.MAX_FOREIGN_PLAYERS_REGISTRATION,
        maxForeignPlayersMatch: REQUIREMENTS.MAX_FOREIGN_PLAYERS_MATCH,
        minPlayerAge: REQUIREMENTS.MIN_PLAYER_AGE,
        minStadiumCapacity: REQUIREMENTS.MIN_STADIUM_CAPACITY,
        minStadiumRating: REQUIREMENTS.MIN_STADIUM_RATING,
        governingBodyRequired: `Phải có trụ sở tại ${REQUIREMENTS.REQUIRED_COUNTRY}`,
      },
    };

    await sendTeamInvitationEmail(emails, emailData);
  } catch (error) {
    // Don't fail invitation creation if email fails
    console.error(`Failed to send invitation email for team ${teamId}:`, error);
  }
}

/**
 * Create a single team invitation
 */
export async function createInvitation(input: CreateInvitationInput): Promise<TeamInvitationSummary> {
  // Validate season exists
  const seasonCheck = await query<{ season_id: number; max_teams: number }>(
    `SELECT season_id, max_teams FROM seasons WHERE season_id = @seasonId`,
    { seasonId: input.seasonId }
  );

  if (!seasonCheck.recordset[0]) {
    throw NotFoundError("Season not found");
  }

  // Validate team exists
  const teamCheck = await query<{ team_id: number; name: string; short_name: string | null }>(
    `SELECT team_id, name, short_name FROM teams WHERE team_id = @teamId`,
    { teamId: input.teamId }
  );

  if (!teamCheck.recordset[0]) {
    throw NotFoundError("Team not found");
  }

  // Check if invitation already exists
  const existingInv = await query<{ invitation_id: number }>(
    `SELECT invitation_id FROM season_invitations WHERE season_id = @seasonId AND team_id = @teamId`,
    { seasonId: input.seasonId, teamId: input.teamId }
  );

  if (existingInv.recordset[0]) {
    throw BadRequestError("Invitation already exists for this team in this season");
  }

  const responseDeadline = new Date(input.responseDeadline);
  const invitedAt = new Date();

  if (responseDeadline <= invitedAt) {
    throw BadRequestError("Response deadline must be in the future");
  }

  const daysDiff = Math.ceil((responseDeadline.getTime() - invitedAt.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 14) {
    throw BadRequestError("Response deadline cannot be more than 14 days from invitation date");
  }

  const result = await query<{
    invitation_id: number;
    status: string;
    invited_at: string;
    response_deadline: string;
  }>(
    `
    INSERT INTO season_invitations (
      season_id, team_id, invite_type, status, 
      invited_at, response_deadline, invited_by
    )
    OUTPUT INSERTED.invitation_id, INSERTED.status, 
           CONVERT(VARCHAR(23), INSERTED.invited_at, 126) AS invited_at,
           CONVERT(VARCHAR(23), INSERTED.response_deadline, 126) AS response_deadline
    VALUES (
      @seasonId, @teamId, @inviteType, 'pending',
      @invitedAt, @responseDeadline, @invitedBy
    )
    `,
    {
      seasonId: input.seasonId,
      teamId: input.teamId,
      inviteType: input.inviteType,
      invitedAt,
      responseDeadline,
      invitedBy: input.invitedBy,
    }
  );

  const inserted = result.recordset[0];
  if (!inserted) {
    throw new Error("Failed to create invitation");
  }

  const team = teamCheck.recordset[0];
  
  const invitation: TeamInvitationSummary = {
    invitationId: inserted.invitation_id,
    teamId: input.teamId,
    teamName: team.name,
    shortName: team.short_name,
    inviteType: input.inviteType,
    status: inserted.status as TeamInvitationSummary["status"],
    invitedAt: inserted.invited_at,
    responseDeadline: inserted.response_deadline,
    respondedAt: null,
    previousSeasonRank: input.previousSeasonRank ?? null,
  };

  // Send invitation email asynchronously (non-blocking)
  sendInvitationEmailAsync(
    input.teamId,
    team.name,
    input.seasonId,
    invitation.invitationId,
    inserted.response_deadline
  ).catch((error) => {
    console.error("Failed to send invitation email:", error);
  });

  return invitation;
}

/**
 * Automatically create invitations for a new season based on previous season standings
 * - Top 8 teams from previous season (retained)
 * - Top 2 promoted teams (promoted) - can be manually specified or auto-detected
 */
export async function autoCreateInvitations(
  input: AutoCreateInvitationsInput
): Promise<{
  created: number;
  retained: TeamInvitationSummary[];
  promoted: TeamInvitationSummary[];
}> {
  const deadlineDays = input.responseDeadlineDays ?? 14;
  const responseDeadline = new Date();
  responseDeadline.setDate(responseDeadline.getDate() + deadlineDays);

  // Get top 8 teams from previous season
  const top8Teams = await getTopTeamsFromSeason(input.previousSeasonId, 8);

  if (top8Teams.length < 8) {
    throw BadRequestError(
      `Not enough teams in previous season. Found ${top8Teams.length}, need 8.`
    );
  }

  const created: TeamInvitationSummary[] = [];
  const retained: TeamInvitationSummary[] = [];
  const promoted: TeamInvitationSummary[] = [];

  return transaction(async (tx) => {
    // Create invitations for top 8 retained teams
    for (const team of top8Teams) {
      try {
        const invitation = await createInvitationInTransaction(tx, {
          seasonId: input.seasonId,
          teamId: team.teamId,
          inviteType: "retained",
          responseDeadline: responseDeadline.toISOString(),
          invitedBy: input.invitedBy,
          previousSeasonRank: team.rank,
        });

        created.push(invitation);
        retained.push(invitation);
      } catch (error: any) {
        // Skip if invitation already exists
        if (error.message?.includes("already exists")) {
          console.warn(`Invitation already exists for team ${team.teamId}`);
          continue;
        }
        throw error;
      }
    }

    // Handle promoted teams
    if (input.promotedTeamIds && input.promotedTeamIds.length > 0) {
      // Use manually specified promoted teams
      if (input.promotedTeamIds.length > 2) {
        throw BadRequestError("Cannot promote more than 2 teams");
      }

      for (const teamId of input.promotedTeamIds) {
        try {
          const teamInfo = await query<{ team_id: number; name: string; short_name: string | null }>(
            `SELECT team_id, name, short_name FROM teams WHERE team_id = @teamId`,
            { teamId }
          ).then((r) => r.recordset[0]);

          if (!teamInfo) {
            throw NotFoundError(`Promoted team ${teamId} not found`);
          }

          const invitation = await createInvitationInTransaction(tx, {
            seasonId: input.seasonId,
            teamId: teamId,
            inviteType: "promoted",
            responseDeadline: responseDeadline.toISOString(),
            invitedBy: input.invitedBy,
            previousSeasonRank: null,
          });

          created.push(invitation);
          promoted.push(invitation);
        } catch (error: any) {
          if (error.message?.includes("already exists")) {
            console.warn(`Invitation already exists for promoted team ${teamId}`);
            continue;
          }
          throw error;
        }
      }
    } else {
      // Try to get promoted teams from a lower division season
      // For now, this requires manual specification via promotedTeamIds
      // In the future, this could query a lower division season
      throw BadRequestError(
        "Promoted teams must be specified manually via promotedTeamIds parameter"
      );
    }

    return {
      created: created.length,
      retained,
      promoted,
    };
  });
}

/**
 * Helper function to create invitation within a transaction
 */
async function createInvitationInTransaction(
  tx: SqlTransaction,
  input: CreateInvitationInput
): Promise<TeamInvitationSummary> {
  const responseDeadline = new Date(input.responseDeadline);
  const invitedAt = new Date();

  // Check if invitation already exists
  const checkRequest = new sql.Request(tx);
  checkRequest.input("seasonId", sql.Int, input.seasonId);
  checkRequest.input("teamId", sql.Int, input.teamId);
  const existingCheck = await checkRequest.query(`
    SELECT invitation_id FROM season_invitations 
    WHERE season_id = @seasonId AND team_id = @teamId
  `);

  if (existingCheck.recordset[0]) {
    throw BadRequestError("Invitation already exists for this team in this season");
  }

  const request = new sql.Request(tx);
  request.input("seasonId", sql.Int, input.seasonId);
  request.input("teamId", sql.Int, input.teamId);
  request.input("inviteType", sql.VarChar(32), input.inviteType);
  request.input("invitedAt", sql.DateTime2, invitedAt);
  request.input("responseDeadline", sql.DateTime2, responseDeadline);
  request.input("invitedBy", sql.Int, input.invitedBy);

  const result = await request.query(`
    INSERT INTO season_invitations (
      season_id, team_id, invite_type, status, 
      invited_at, response_deadline, invited_by
    )
    OUTPUT INSERTED.invitation_id, INSERTED.status, 
           CONVERT(VARCHAR(23), INSERTED.invited_at, 126) AS invited_at,
           CONVERT(VARCHAR(23), INSERTED.response_deadline, 126) AS response_deadline
    VALUES (
      @seasonId, @teamId, @inviteType, 'pending',
      @invitedAt, @responseDeadline, @invitedBy
    )
  `);

  const inserted = result.recordset[0];
  if (!inserted) {
    throw new Error("Failed to create invitation");
  }

  const teamRequest = new sql.Request(tx);
  teamRequest.input("teamId", sql.Int, input.teamId);
  const teamResult = await teamRequest.query(`
    SELECT team_id, name, short_name FROM teams WHERE team_id = @teamId
  `);

  const team = teamResult.recordset[0];
  if (!team) {
    throw NotFoundError("Team not found");
  }

  const invitation: TeamInvitationSummary = {
    invitationId: inserted.invitation_id,
    teamId: input.teamId,
    teamName: team.name,
    shortName: team.short_name,
    inviteType: input.inviteType,
    status: inserted.status as TeamInvitationSummary["status"],
    invitedAt: inserted.invited_at,
    responseDeadline: inserted.response_deadline,
    respondedAt: null,
    previousSeasonRank: input.previousSeasonRank ?? null,
  };

  // Send invitation email asynchronously (non-blocking)
  sendInvitationEmailAsync(
    input.teamId,
    team.name,
    input.seasonId,
    invitation.invitationId,
    inserted.response_deadline
  ).catch((error) => {
    console.error("Failed to send invitation email:", error);
  });

  return invitation;
}

/**
 * List all invitations for a season
 */
export async function listSeasonInvitations(seasonId: number): Promise<TeamInvitationSummary[]> {
  const result = await query<{
    invitation_id: number;
    team_id: number;
    team_name: string;
    short_name: string | null;
    invite_type: string;
    status: string;
    invited_at: string;
    response_deadline: string;
    responded_at: string | null;
    previous_season_rank: number | null;
    replacement_for_id: number | null;
  }>(
    `
    SELECT 
      si.invitation_id,
      t.team_id,
      t.name AS team_name,
      t.short_name,
      si.invite_type,
      si.status,
      CONVERT(VARCHAR(23), si.invited_at, 126) AS invited_at,
      CONVERT(VARCHAR(23), si.response_deadline, 126) AS response_deadline,
      CONVERT(VARCHAR(23), si.responded_at, 126) AS responded_at,
      NULL AS previous_season_rank,
      si.replacement_for_id
    FROM season_invitations si
    INNER JOIN teams t ON si.team_id = t.team_id
    WHERE si.season_id = @seasonId
    ORDER BY si.invited_at DESC
    `,
    { seasonId }
  );

  return result.recordset.map((row) => ({
    invitationId: row.invitation_id,
    teamId: row.team_id,
    teamName: row.team_name,
    shortName: row.short_name,
    inviteType: row.invite_type as TeamInvitationSummary["inviteType"],
    status: row.status as TeamInvitationSummary["status"],
    invitedAt: row.invited_at,
    responseDeadline: row.response_deadline,
    respondedAt: row.responded_at,
    previousSeasonRank: row.previous_season_rank,
  }));
}

/**
 * Update invitation status
 */
export async function updateInvitationStatus(
  invitationId: number,
  status: TeamInvitationSummary["status"],
  respondedBy: number,
  responseNotes?: string
): Promise<void> {
  const respondedAt = status === "accepted" || status === "declined" ? new Date() : null;

  await query(
    `
    UPDATE season_invitations
    SET status = @status,
        responded_at = @respondedAt,
        responded_by = @respondedBy,
        response_notes = @responseNotes
    WHERE invitation_id = @invitationId
    `,
    {
      invitationId,
      status,
      respondedAt,
      respondedBy,
      responseNotes: responseNotes ?? null,
    }
  );
}

/**
 * Get number of accepted invitations for a season
 */
export async function getAcceptedTeamsCount(seasonId: number): Promise<number> {
  const result = await query<{ count: number }>(
    `
    SELECT COUNT(*) AS count
    FROM season_invitations
    WHERE season_id = @seasonId AND status = 'accepted'
    `,
    { seasonId }
  );

  return result.recordset[0]?.count ?? 0;
}

/**
 * Find the next available replacement team from previous season standings
 * Excludes teams that already have invitations (accepted, pending, or declined but not replaced)
 */
export async function findReplacementTeam(
  seasonId: number,
  previousSeasonId: number,
  excludedInvitationId?: number
): Promise<{ teamId: number; teamName: string; rank: number } | null> {
  // Get all teams from previous season, ordered by rank
  const allTeams = await getTopTeamsFromSeason(previousSeasonId, 100); // Get up to 100 teams

  // Get all teams that already have invitations for this season
  const existingInvitations = await query<{ team_id: number }>(
    `
    SELECT DISTINCT team_id
    FROM season_invitations
    WHERE season_id = @seasonId
      AND (status IN ('accepted', 'pending') 
           OR (status = 'declined' AND invitation_id NOT IN (
               SELECT replacement_for_id FROM season_invitations WHERE replacement_for_id IS NOT NULL
           )))
      ${excludedInvitationId ? 'AND invitation_id != @excludedInvitationId' : ''}
    `,
    { seasonId, excludedInvitationId: excludedInvitationId ?? null }
  );

  const excludedTeamIds = new Set(
    existingInvitations.recordset.map((row) => row.team_id)
  );

  // Find first team that doesn't have an active invitation
  for (const team of allTeams) {
    if (!excludedTeamIds.has(team.teamId)) {
      return {
        teamId: team.teamId,
        teamName: team.teamName,
        rank: team.rank,
      };
    }
  }

  return null;
}

/**
 * Create a replacement invitation for a declined/expired invitation
 */
export async function createReplacementInvitation(
  seasonId: number,
  replacementTeamId: number,
  replacedInvitationId: number,
  invitedBy: number,
  responseDeadlineDays?: number
): Promise<TeamInvitationSummary> {
  // Verify the invitation to be replaced exists and is declined/expired
  const replacedInv = await query<{
    invitation_id: number;
    team_id: number;
    status: string;
    response_deadline: string;
  }>(
    `
    SELECT invitation_id, team_id, status, response_deadline
    FROM season_invitations
    WHERE invitation_id = @replacedInvitationId
    `,
    { replacedInvitationId }
  );

  if (!replacedInv.recordset[0]) {
    throw NotFoundError("Invitation to be replaced not found");
  }

  const replaced = replacedInv.recordset[0];
  if (replaced.status !== "declined" && replaced.status !== "expired") {
    throw BadRequestError(
      `Cannot create replacement for invitation with status: ${replaced.status}. Must be 'declined' or 'expired'.`
    );
  }

  // Calculate new deadline (14 days from now, or use provided)
  const deadlineDays = responseDeadlineDays ?? 14;
  const responseDeadline = new Date();
  responseDeadline.setDate(responseDeadline.getDate() + deadlineDays);

  // Create replacement invitation
  const result = await query<{
    invitation_id: number;
    status: string;
    invited_at: string;
    response_deadline: string;
  }>(
    `
    INSERT INTO season_invitations (
      season_id, team_id, invite_type, status,
      invited_at, response_deadline, invited_by, replacement_for_id
    )
    OUTPUT INSERTED.invitation_id, INSERTED.status,
           CONVERT(VARCHAR(23), INSERTED.invited_at, 126) AS invited_at,
           CONVERT(VARCHAR(23), INSERTED.response_deadline, 126) AS response_deadline
    VALUES (
      @seasonId, @replacementTeamId, 'replacement', 'pending',
      @invitedAt, @responseDeadline, @invitedBy, @replacedInvitationId
    )
    `,
    {
      seasonId,
      replacementTeamId,
      invitedAt: new Date(),
      responseDeadline,
      invitedBy,
      replacedInvitationId,
    }
  );

  const inserted = result.recordset[0];
  if (!inserted) {
    throw new Error("Failed to create replacement invitation");
  }

  // Update replaced invitation status
  await query(
    `
    UPDATE season_invitations
    SET status = 'replaced'
    WHERE invitation_id = @replacedInvitationId
    `,
    { replacedInvitationId }
  );

  // Get team info
  const teamInfo = await query<{ team_id: number; name: string; short_name: string | null }>(
    `SELECT team_id, name, short_name FROM teams WHERE team_id = @replacementTeamId`,
    { replacementTeamId }
  );

  const team = teamInfo.recordset[0];
  if (!team) {
    throw NotFoundError("Replacement team not found");
  }

  const invitation: TeamInvitationSummary = {
    invitationId: inserted.invitation_id,
    teamId: replacementTeamId,
    teamName: team.name,
    shortName: team.short_name,
    inviteType: "replacement",
    status: inserted.status as TeamInvitationSummary["status"],
    invitedAt: inserted.invited_at,
    responseDeadline: inserted.response_deadline,
    respondedAt: null,
    previousSeasonRank: null,
  };

  // Send invitation email asynchronously (non-blocking)
  sendInvitationEmailAsync(
    replacementTeamId,
    team.name,
    seasonId,
    invitation.invitationId,
    inserted.response_deadline
  ).catch((error) => {
    console.error("Failed to send replacement invitation email:", error);
  });

  return invitation;
}

/**
 * Automatically process replacement invitations to ensure minimum 10 accepted teams
 * Returns list of created replacement invitations
 */
export async function ensureMinimumAcceptedTeams(
  seasonId: number,
  previousSeasonId: number,
  minimumTeams: number = 10,
  invitedBy: number,
  responseDeadlineDays?: number
): Promise<{
  currentCount: number;
  targetCount: number;
  createdReplacements: TeamInvitationSummary[];
  needMore: number;
}> {
  const currentCount = await getAcceptedTeamsCount(seasonId);
  const needMore = Math.max(0, minimumTeams - currentCount);

  if (needMore === 0) {
    return {
      currentCount,
      targetCount: minimumTeams,
      createdReplacements: [],
      needMore: 0,
    };
  }

  // Get declined/expired invitations that haven't been replaced yet
  const declinedInvitations = await query<{
    invitation_id: number;
    team_id: number;
    team_name: string;
    status: string;
  }>(
    `
    SELECT 
      si.invitation_id,
      si.team_id,
      t.name AS team_name,
      si.status
    FROM season_invitations si
    INNER JOIN teams t ON si.team_id = t.team_id
    WHERE si.season_id = @seasonId
      AND si.status IN ('declined', 'expired')
      AND NOT EXISTS (
        SELECT 1 FROM season_invitations r
        WHERE r.replacement_for_id = si.invitation_id
      )
    ORDER BY si.invited_at ASC
    `,
    { seasonId }
  );

  const createdReplacements: TeamInvitationSummary[] = [];

  // Process each declined/expired invitation and create replacements
  for (let i = 0; i < Math.min(needMore, declinedInvitations.recordset.length); i++) {
    const declinedInv = declinedInvitations.recordset[i];

    try {
      // Find replacement team
      const replacementTeam = await findReplacementTeam(
        seasonId,
        previousSeasonId,
        declinedInv.invitation_id
      );

      if (!replacementTeam) {
        console.warn(
          `No replacement team available for declined invitation ${declinedInv.invitation_id}`
        );
        continue;
      }

      // Create replacement invitation
      const replacement = await createReplacementInvitation(
        seasonId,
        replacementTeam.teamId,
        declinedInv.invitation_id,
        invitedBy,
        responseDeadlineDays
      );

      createdReplacements.push(replacement);
    } catch (error: any) {
      console.error(
        `Failed to create replacement for invitation ${declinedInv.invitation_id}:`,
        error.message
      );
      // Continue with next invitation
    }
  }

  return {
    currentCount,
    targetCount: minimumTeams,
    createdReplacements,
    needMore: needMore - createdReplacements.length,
  };
}

