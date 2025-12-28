import { query } from "../db/sqlServer";

export interface SeasonInvitation {
  invitation_id: number;
  season_id: number;
  team_id: number;
  team_name: string;
  season_name: string;
  invite_type: "retained" | "promoted" | "replacement";
  status: "pending" | "accepted" | "rejected" | "expired";
  invited_at: string;
  response_deadline: string;
  responded_at: string | null;
  response_notes: string | null;
  invited_by: number;
  responded_by: number | null;
  replacement_for_id: number | null;
}

const baseInvitationSelect = `
  SELECT
    si.invitation_id,
    si.season_id,
    si.team_id,
    t.name AS team_name,
    s.name AS season_name,
    si.invite_type,
    si.status,
    CONVERT(VARCHAR(23), si.invited_at, 126) AS invited_at,
    CONVERT(VARCHAR(23), si.response_deadline, 126) AS response_deadline,
    CONVERT(VARCHAR(23), si.responded_at, 126) AS responded_at,
    si.response_notes,
    si.invited_by,
    si.responded_by,
    si.replacement_for_id
  FROM season_invitations si
  INNER JOIN seasons s ON si.season_id = s.season_id
  INNER JOIN teams t ON si.team_id = t.team_id
`;

const TARGET_TEAMS = 10;
const RETAINED_TOP = 8;
const PROMOTED_TOP = 2;

function deadlineISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Helper: check if invitation already exists
 */
async function invitationExists(seasonId: number, teamId: number): Promise<boolean> {
  const rs = await query<{ cnt: number }>(
    `
    SELECT COUNT(*) AS cnt
    FROM season_invitations
    WHERE season_id = @seasonId AND team_id = @teamId
      AND status IN ('pending', 'accepted')
    `,
    { seasonId, teamId }
  );
  return (rs.recordset[0]?.cnt ?? 0) > 0;
}

/**
 * Helper: count pending+accepted
 */
async function countActiveInvites(seasonId: number): Promise<number> {
  const rs = await query<{ count: number }>(
    `
    SELECT COUNT(*) AS count
    FROM season_invitations
    WHERE season_id = @seasonId
      AND status IN ('pending', 'accepted')
    `,
    { seasonId }
  );
  return rs.recordset[0]?.count ?? 0;
}

/**
/**
 * 1.1 AUTO CREATE (PHƯƠNG ÁN A - hợp DB hiện tại)
 * - Ưu tiên lấy danh sách 10 đội dự kiến từ season_team_participants của chính season này
 * - 8 đội đầu (joined_at ASC) => retained
 * - 2 đội sau => promoted
 *
 * QUOTA GUARD:
 * - Không bao giờ để pending+accepted > 10
 * - Nếu đã đủ 10 active invites thì return
 * - Nếu thiếu, chỉ mời thêm đúng số lượng còn thiếu
 *
 * NOTE: Nếu season_team_participants không có (trống) thì fallback mời 10 đội active mới nhất.
 */
export async function createSeasonInvitations(
  seasonId: number,
  invitedByUserId: number
): Promise<void> {
  const ddl = deadlineISO(14);

  // 0) QUOTA GUARD: chỉ được phép tạo thêm tới khi pending+accepted == 10
  const currentActive = await countActiveInvites(seasonId);
  const remaining = TARGET_TEAMS - currentActive;
  if (remaining <= 0) return;

  // 1) Prefer participants list (BTC list)
  const participantsRs = await query<{ team_id: number }>(
    `
    SELECT TOP ${TARGET_TEAMS} team_id
    FROM season_team_participants
    WHERE season_id = @seasonId
    ORDER BY joined_at ASC
    `,
    { seasonId }
  );

  let selectedTeamIds = participantsRs.recordset.map((r) => r.team_id);

  // 2) Fallback: if participants empty, invite from active teams
  if (selectedTeamIds.length === 0) {
    const fallback = await query<{ team_id: number }>(
      `
      SELECT TOP ${TARGET_TEAMS} t.team_id
      FROM teams t
      WHERE t.status = 'active'
      ORDER BY t.created_at DESC
      `
    );
    selectedTeamIds = fallback.recordset.map((r) => r.team_id);
  }

  // Dedupe safety
  selectedTeamIds = Array.from(new Set(selectedTeamIds));

  // Split types (8 retained + 2 promoted) in THIS season context
  const retainedTeamIds = new Set(selectedTeamIds.slice(0, RETAINED_TOP));
  const promotedTeamIds = new Set(selectedTeamIds.slice(RETAINED_TOP, RETAINED_TOP + PROMOTED_TOP));

  // 3) Insert only up to "remaining" (quota safe)
  let inserted = 0;

  for (const teamId of selectedTeamIds) {
    if (inserted >= remaining) break;

    // Skip if already exists
    if (await invitationExists(seasonId, teamId)) continue;

    const inviteType: "retained" | "promoted" =
      retainedTeamIds.has(teamId) ? "retained" : "promoted";

    await query(
      `
      INSERT INTO season_invitations
        (season_id, team_id, invite_type, status, invited_at, response_deadline, invited_by)
      VALUES
        (@seasonId, @teamId, @inviteType, 'pending', GETUTCDATE(), @deadline, @invitedBy)
      `,
      {
        seasonId,
        teamId,
        inviteType,
        deadline: ddl,
        invitedBy: invitedByUserId,
      }
    );

    inserted++;
  }
}


/**
 * 1.2 AUTO FILL (replacement)
 * Fill until pending+accepted reaches 10.
 *
 * Strategy:
 *  - First: if some participants chưa được invite (do invite lỗi/thiếu), invite tiếp từ participants.
 *  - Then fallback: teams active chưa từng được invite trong season này.
 */
export async function sendReplacementInvitations(
  seasonId: number,
  invitedByUserId: number
): Promise<{ created: number; neededBefore: number }> {
  const current = await countActiveInvites(seasonId);
  const neededBefore = Math.max(0, TARGET_TEAMS - current);
  if (neededBefore <= 0) return { created: 0, neededBefore };

  const ddl = deadlineISO(14);
  let created = 0;

  // A) Invite remaining participants that have no invitation yet
  const participantCandidates = await query<{ team_id: number }>(
    `
    SELECT stp.team_id
    FROM season_team_participants stp
    WHERE stp.season_id = @seasonId
      AND NOT EXISTS (
        SELECT 1 FROM season_invitations si
        WHERE si.season_id = @seasonId
          AND si.team_id = stp.team_id
      )
    ORDER BY stp.joined_at ASC
    `,
    { seasonId }
  );

  for (const r of participantCandidates.recordset) {
    if (created >= neededBefore) break;

    await query(
      `
      INSERT INTO season_invitations
        (season_id, team_id, invite_type, status, invited_at, response_deadline, invited_by)
      VALUES
        (@seasonId, @teamId, 'replacement', 'pending', GETUTCDATE(), @deadline, @invitedBy)
      `,
      {
        seasonId,
        teamId: r.team_id,
        deadline: ddl,
        invitedBy: invitedByUserId,
      }
    );
    created++;
  }

  // B) Fallback to active teams not invited yet
  if (created < neededBefore) {
    const remaining = neededBefore - created;

    const fallbackCandidates = await query<{ team_id: number }>(
      `
      SELECT TOP (@take) t.team_id
      FROM teams t
      WHERE t.status = 'active'
        AND NOT EXISTS (
          SELECT 1 FROM season_invitations si
          WHERE si.season_id = @seasonId
            AND si.team_id = t.team_id
        )
      ORDER BY t.created_at DESC
      `,
      { take: remaining, seasonId }
    );

    for (const r of fallbackCandidates.recordset) {
      await query(
        `
        INSERT INTO season_invitations
          (season_id, team_id, invite_type, status, invited_at, response_deadline, invited_by)
        VALUES
          (@seasonId, @teamId, 'replacement', 'pending', GETUTCDATE(), @deadline, @invitedBy)
        `,
        {
          seasonId,
          teamId: r.team_id,
          deadline: ddl,
          invitedBy: invitedByUserId,
        }
      );
      created++;
    }
  }

  return { created, neededBefore };
}

/* ===== READ ===== */

export async function getSeasonInvitations(seasonId: number): Promise<SeasonInvitation[]> {
  const rs = await query<SeasonInvitation>(
    `${baseInvitationSelect} WHERE si.season_id = @seasonId ORDER BY si.invited_at DESC`,
    { seasonId }
  );
  return rs.recordset;
}

export async function getInvitationsSummary(seasonId: number): Promise<{
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  rescinded: number;
  expired: number;
}> {
  const rs = await query<{
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    rescinded: number;
    expired: number;
  }>(
    `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS accepted,
      SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) AS declined,
      SUM(CASE WHEN status = 'rescinded' THEN 1 ELSE 0 END) AS rescinded,
      SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) AS expired
    FROM season_invitations
    WHERE season_id = @seasonId
    `,
    { seasonId }
  );

  return {
    total: rs.recordset[0]?.total || 0,
    pending: rs.recordset[0]?.pending || 0,
    accepted: rs.recordset[0]?.accepted || 0,
    rejected: rs.recordset[0]?.declined || 0,
    rescinded: rs.recordset[0]?.rescinded || 0,
    expired: rs.recordset[0]?.expired || 0,
  };
}

/* ===== UPDATE ===== */

export async function acceptInvitation(invitationId: number, userId: number, notes?: string): Promise<void> {
  await query(
    `
    UPDATE season_invitations
    SET status = 'accepted',
        responded_at = GETUTCDATE(),
        response_notes = @notes,
        responded_by = @userId
    WHERE invitation_id = @invitationId
    `,
    { invitationId, notes: notes ?? null, userId }
  );
}

export async function rejectInvitation(invitationId: number, userId: number, notes?: string): Promise<void> {
  const rs = await query<{ season_id: number; invited_by: number }>(
    `SELECT season_id, invited_by FROM season_invitations WHERE invitation_id = @invitationId`,
    { invitationId }
  );

  await query(
    `
    UPDATE season_invitations
    SET status = 'declined',
        responded_at = GETUTCDATE(),
        response_notes = @notes,
        responded_by = @userId
    WHERE invitation_id = @invitationId
    `,
    { invitationId, notes: notes ?? null, userId }
  );

  const seasonId = rs.recordset[0]?.season_id;
  if (seasonId) {
    await sendReplacementInvitations(seasonId, rs.recordset[0]?.invited_by ?? userId);
  }
}

export async function rescindInvitation(invitationId: number, userId: number, notes?: string): Promise<void> {
  await query(
    `
    UPDATE season_invitations
    SET status = 'rescinded',
        responded_at = GETUTCDATE(),
        response_notes = @notes,
        responded_by = @userId
    WHERE invitation_id = @invitationId
      AND status = 'pending'
    `,
    { invitationId, notes: notes ?? 'Rescinded by admin', userId }
  );
}

export async function reinviteTeam(
  seasonId: number,
  originalInvitationId: number,
  userId: number
): Promise<SeasonInvitation> {
  // 1. Get original details
  const inv = await getInvitationDetails(originalInvitationId);
  if (!inv) throw new Error("Invitation not found");
  if (inv.season_id !== seasonId) throw new Error("Season mismatch");

  // 2. Check for ANY active invitation for this team (including the current one if it were active)
  if (['pending', 'accepted'].includes(inv.status)) {
    throw new Error("Invitation is already active");
  }

  // Also check if there's ANOTHER active invitation for this team (just in case of no unique constraint)
  if (await invitationExists(seasonId, inv.team_id)) {
    throw new Error("Team already has an active invitation");
  }

  // 3. Update existing invitation (Re-use record to satisfy Unique Constraint)
  const ddl = deadlineISO(14);
  await query(
    `
    UPDATE season_invitations
    SET status = 'pending',
        invited_at = GETUTCDATE(),
        response_deadline = @deadline,
        invited_by = @userId,
        responded_at = NULL,
        responded_by = NULL,
        response_notes = NULL,
        replacement_for_id = NULL -- Reset or keep? Keeping NULL or existing is fine.
    WHERE invitation_id = @originalInvitationId
    `,
    {
      originalInvitationId,
      deadline: ddl,
      userId
    }
  );

  return (await getInvitationDetails(originalInvitationId))!;
}

/**
 * Mark expired invitations globally; return affected seasonIds
 */
export async function markExpiredInvitations(): Promise<number[]> {
  const rs = await query<{ season_id: number }>(
    `
    SELECT DISTINCT season_id
    FROM season_invitations
    WHERE status = 'pending'
      AND response_deadline < GETUTCDATE()
    `
  );

  await query(
    `
    UPDATE season_invitations
    SET status = 'expired'
    WHERE status = 'pending'
      AND response_deadline < GETUTCDATE()
    `
  );

  return rs.recordset.map((r) => r.season_id);
}
// ===== EXTRA READ HELPERS (Team endpoints need these) =====

export async function getInvitationDetails(
  invitationId: number
): Promise<SeasonInvitation | null> {
  const rs = await query<SeasonInvitation>(
    `${baseInvitationSelect} WHERE si.invitation_id = @invitationId`,
    { invitationId }
  );
  return rs.recordset[0] ?? null;
}

export async function getPendingInvitationsForTeam(
  teamId: number
): Promise<SeasonInvitation[]> {
  const rs = await query<SeasonInvitation>(
    `
    ${baseInvitationSelect}
    WHERE si.team_id = @teamId
      AND si.status = 'pending'
      AND si.response_deadline > GETUTCDATE()
    ORDER BY si.response_deadline ASC
    `,
    { teamId }
  );
  return rs.recordset;
}
