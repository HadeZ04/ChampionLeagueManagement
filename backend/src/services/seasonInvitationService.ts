import { query } from "../db/sqlServer";

export interface SeasonInvitation {
  invitation_id: number;
  season_id: number;
  team_id: number;
  team_name: string;
  season_name: string;
  invited_by_user_id: number;
  sent_at: string;
  response_status: "pending" | "accepted" | "rejected" | "expired";
  response_date: string | null;
  response_notes: string | null;
  deadline: string;
  created_at: string;
}

const baseInvitationSelect = `
  SELECT
    si.invitation_id,
    si.season_id,
    si.team_id,
    t.name AS team_name,
    s.name AS season_name,
    si.invited_by_user_id,
    CONVERT(VARCHAR(23), si.sent_at, 126) AS sent_at,
    si.response_status,
    CONVERT(VARCHAR(23), si.response_date, 126) AS response_date,
    si.response_notes,
    CONVERT(VARCHAR(23), si.deadline, 126) AS deadline,
    CONVERT(VARCHAR(23), si.created_at, 126) AS created_at
  FROM season_invitations si
  INNER JOIN seasons s ON si.season_id = s.season_id
  INNER JOIN teams t ON si.team_id = t.team_id
`;

/**
 * Create invitations for a season (send to 14 previous teams + 2 promoted teams)
 */
export async function createSeasonInvitations(
  seasonId: number,
  invitedByUserId: number
): Promise<void> {
  // Get 14 teams from previous season
  const prevSeasonResult = await query<{
    prev_season_id: number;
  }>(
    `
    SELECT TOP 1 s.season_id AS prev_season_id
    FROM seasons s
    WHERE s.tournament_id = (SELECT tournament_id FROM seasons WHERE season_id = @seasonId)
    AND s.season_id < @seasonId
    ORDER BY s.season_id DESC
  `,
    { seasonId }
  );

  const previousSeasonId = prevSeasonResult.recordset[0]?.prev_season_id;

  // Get top 14 teams from previous season standings or all if not available
  const prevTeamsResult = await query<{ team_id: number }>(
    `
    SELECT TOP 14 DISTINCT str.team_id
    FROM standings str
    WHERE str.season_id = @seasonId
    ORDER BY str.position ASC
  `,
    { seasonId: previousSeasonId || seasonId }
  );

  // Get promoted teams (logic: get teams from division below or last season runners-up)
  const promotedTeamsResult = await query<{ team_id: number }>(
    `
    SELECT TOP 2 t.team_id
    FROM teams t
    LEFT JOIN season_team_registrations str ON t.team_id = str.team_id AND str.season_id = @seasonId
    WHERE str.team_id IS NULL
    AND t.status = 'active'
    ORDER BY t.created_at DESC
  `,
    { seasonId }
  );

  const allInvitedTeamIds = [
    ...prevTeamsResult.recordset.map((r) => r.team_id),
    ...promotedTeamsResult.recordset.map((r) => r.team_id),
  ];

  // Remove duplicates
  const uniqueTeamIds = Array.from(new Set(allInvitedTeamIds));

  // Create invitations
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 14); // 2 weeks deadline

  for (const teamId of uniqueTeamIds) {
    await query(
      `
      INSERT INTO season_invitations (season_id, team_id, invited_by_user_id, sent_at, response_status, deadline, created_at)
      VALUES (@seasonId, @teamId, @invitedByUserId, GETUTCDATE(), 'pending', @deadline, GETUTCDATE())
    `,
      {
        seasonId,
        teamId,
        invitedByUserId,
        deadline: deadline.toISOString(),
      }
    );
  }
}

/**
 * Get all invitations for a season
 */
export async function getSeasonInvitations(
  seasonId: number
): Promise<SeasonInvitation[]> {
  const result = await query<SeasonInvitation>(
    `${baseInvitationSelect} WHERE si.season_id = @seasonId ORDER BY si.sent_at DESC`,
    { seasonId }
  );
  return result.recordset;
}

/**
 * Get pending invitations for a team
 */
export async function getPendingInvitationsForTeam(
  teamId: number
): Promise<SeasonInvitation[]> {
  const result = await query<SeasonInvitation>(
    `${baseInvitationSelect} 
     WHERE si.team_id = @teamId 
     AND si.response_status = 'pending'
     AND si.deadline > GETUTCDATE()
     ORDER BY si.deadline ASC`,
    { teamId }
  );
  return result.recordset;
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(
  invitationId: number,
  notes?: string
): Promise<void> {
  await query(
    `
    UPDATE season_invitations
    SET response_status = 'accepted', response_date = GETUTCDATE(), response_notes = @notes
    WHERE invitation_id = @invitationId
  `,
    { invitationId, notes: notes || null }
  );
}

/**
 * Reject an invitation
 */
export async function rejectInvitation(
  invitationId: number,
  notes?: string
): Promise<void> {
  await query(
    `
    UPDATE season_invitations
    SET response_status = 'rejected', response_date = GETUTCDATE(), response_notes = @notes
    WHERE invitation_id = @invitationId
  `,
    { invitationId, notes: notes || null }
  );
}

/**
 * Mark expired invitations (past deadline and still pending)
 */
export async function markExpiredInvitations(): Promise<void> {
  await query(
    `
    UPDATE season_invitations
    SET response_status = 'expired'
    WHERE response_status = 'pending' AND deadline < GETUTCDATE()
  `
  );
}

/**
 * Get invitation details
 */
export async function getInvitationDetails(
  invitationId: number
): Promise<SeasonInvitation | null> {
  const result = await query<SeasonInvitation>(
    `${baseInvitationSelect} WHERE si.invitation_id = @invitationId`,
    { invitationId }
  );
  return result.recordset[0] || null;
}

/**
 * Get invitations status summary for a season
 */
export async function getInvitationsSummary(seasonId: number): Promise<{
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  expired: number;
}> {
  const result = await query<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    expired: number;
  }>(
    `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN response_status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN response_status = 'accepted' THEN 1 ELSE 0 END) AS accepted,
      SUM(CASE WHEN response_status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
      SUM(CASE WHEN response_status = 'expired' THEN 1 ELSE 0 END) AS expired
    FROM season_invitations
    WHERE season_id = @seasonId
  `,
    { seasonId }
  );

  return result.recordset[0] || {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    expired: 0,
  };
}
