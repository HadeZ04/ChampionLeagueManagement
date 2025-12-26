import sql from "mssql";
import { query, transaction } from "../db/sqlServer";
import { BadRequestError, ForbiddenError } from "../utils/httpError";
import { registerPlayerForSeason } from "./seasonPlayerRegistrationService";

export interface PlayerRegistrationListFilters {
  seasonId?: number;
  teamId?: number;
  status?: string;
}

export interface CreatePlayerRegistrationInput {
  seasonId: number;
  seasonTeamId: number;
  fullName: string;
  dateOfBirth: string;
  nationality?: string | null;
  positionCode: string;
  shirtNumber?: number | null;
  playerType: string;
  filePath: string;
  actorId?: number;
  actorUsername?: string | null;
  scopedTeamIds?: number[] | null;
}

export interface UpdatePlayerRegistrationInput {
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string | null;
  positionCode?: string;
  shirtNumber?: number | null;
  playerType?: string;
  filePath?: string;
  actorId?: number;
  scopedTeamIds?: number[] | null;
}

function normalizeStatus(value?: string) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!normalized || normalized === "all") {
    return null;
  }
  return normalized;
}

function buildInClause(values: number[], paramPrefix: string) {
  const params: Record<string, unknown> = {};
  const placeholders = values.map((value, index) => {
    const key = `${paramPrefix}${index}`;
    params[key] = value;
    return `@${key}`;
  });
  return { placeholders: placeholders.join(", "), params };
}

export async function listPlayerRegistrations(
  filters: PlayerRegistrationListFilters,
  scopedTeamIds?: number[] | null
) {
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters.seasonId) {
    conditions.push("spr.season_id = @seasonId");
    params.seasonId = filters.seasonId;
  }

  if (filters.teamId) {
    conditions.push("stp.team_id = @teamId");
    params.teamId = filters.teamId;
  }

  const status = normalizeStatus(filters.status);
  if (status) {
    conditions.push("spr.registration_status = @status");
    params.status = status;
  }

  if (Array.isArray(scopedTeamIds)) {
    if (scopedTeamIds.length === 0) {
      return [];
    }
    const { placeholders, params: inParams } = buildInClause(scopedTeamIds, "scopedTeamId");
    conditions.push(`stp.team_id IN (${placeholders})`);
    Object.assign(params, inParams);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await query(
      `
        SELECT
          spr.season_player_id AS id,
          spr.season_id,
          spr.player_id,
          spr.season_team_id,
          spr.registration_status,
          spr.registered_at,
          spr.approved_at,
          spr.approved_by,
          spr.file_path,
          spr.reject_reason,
          spr.position_code,
          spr.shirt_number,
          spr.player_type,
          p.full_name AS player_name,
          p.date_of_birth,
          p.nationality,
          t.team_id,
          t.name AS team_name,
          t.logo_url,
          s.name AS season_name
        FROM season_player_registrations spr
        JOIN players p ON spr.player_id = p.player_id
        JOIN season_team_participants stp ON spr.season_team_id = stp.season_team_id
        JOIN teams t ON stp.team_id = t.team_id
        JOIN seasons s ON spr.season_id = s.season_id
        ${whereClause}
        ORDER BY spr.registered_at DESC
      `,
      params
    );

    return result.recordset;
  } catch (err: any) {
    // Allow older schemas that don't yet have reject_reason.
    if (err?.number !== 207 || !/reject_reason/i.test(String(err?.message ?? ""))) {
      throw err;
    }

    const result = await query(
      `
        SELECT
          spr.season_player_id AS id,
          spr.season_id,
          spr.player_id,
          spr.season_team_id,
          spr.registration_status,
          spr.registered_at,
          spr.approved_at,
          spr.approved_by,
          spr.file_path,
          spr.position_code,
          spr.shirt_number,
          spr.player_type,
          p.full_name AS player_name,
          p.date_of_birth,
          p.nationality,
          t.team_id,
          t.name AS team_name,
          t.logo_url,
          s.name AS season_name
        FROM season_player_registrations spr
        JOIN players p ON spr.player_id = p.player_id
        JOIN season_team_participants stp ON spr.season_team_id = stp.season_team_id
        JOIN teams t ON stp.team_id = t.team_id
        JOIN seasons s ON spr.season_id = s.season_id
        ${whereClause}
        ORDER BY spr.registered_at DESC
      `,
      params
    );

    return result.recordset.map((row: any) => ({ ...row, reject_reason: null }));
  }
}

export async function createPlayerRegistration(input: CreatePlayerRegistrationInput) {
  const fullName = String(input.fullName ?? "").trim();
  if (!fullName) {
    throw BadRequestError("Full name is required");
  }

  const dateOfBirth = new Date(input.dateOfBirth);
  if (Number.isNaN(dateOfBirth.getTime())) {
    throw BadRequestError("Invalid date_of_birth");
  }

  const positionCode = String(input.positionCode ?? "").trim();
  if (!positionCode) {
    throw BadRequestError("position_code is required");
  }

  const playerType = String(input.playerType ?? "").trim().toLowerCase();
  if (!playerType) {
    throw BadRequestError("player_type is required");
  }

  return transaction(async (tx) => {
    const seasonTeamReq = new sql.Request(tx);
    seasonTeamReq.input("seasonTeamId", sql.Int, input.seasonTeamId);
    const seasonTeamResult = await seasonTeamReq.query<{
      season_id: number;
      team_id: number;
    }>(`
      SELECT season_id, team_id
      FROM season_team_participants
      WHERE season_team_id = @seasonTeamId
    `);

    const seasonTeam = seasonTeamResult.recordset[0];
    if (!seasonTeam) {
      throw BadRequestError("SEASON_TEAM_NOT_FOUND");
    }

    if (Number(seasonTeam.season_id) !== Number(input.seasonId)) {
      throw BadRequestError("SEASON_TEAM_NOT_FOUND");
    }

    if (Array.isArray(input.scopedTeamIds) && !input.scopedTeamIds.includes(Number(seasonTeam.team_id))) {
      throw ForbiddenError("You are not allowed to register players for this team");
    }

    const createPlayerReq = new sql.Request(tx);
    createPlayerReq.input("full_name", sql.NVarChar(255), fullName);
    createPlayerReq.input("date_of_birth", sql.Date, dateOfBirth);
    createPlayerReq.input(
      "nationality",
      sql.NVarChar(100),
      input.nationality ? String(input.nationality).trim() : null
    );
    createPlayerReq.input("preferred_position", sql.NVarChar(50), positionCode);
    createPlayerReq.input("current_team_id", sql.Int, Number(seasonTeam.team_id));
    createPlayerReq.input("created_by", sql.Int, input.actorId ?? null);

    let playerId: number;
    try {
      const playerResult = await createPlayerReq.query<{ player_id: number }>(`
        INSERT INTO players (
          full_name,
          display_name,
          date_of_birth,
          nationality,
          preferred_position,
          current_team_id,
          created_by
        )
        OUTPUT INSERTED.player_id
        VALUES (
          @full_name,
          @full_name,
          @date_of_birth,
          @nationality,
          @preferred_position,
          @current_team_id,
          @created_by
        )
      `);

      playerId = Number(playerResult.recordset[0]?.player_id);
    } catch (err: any) {
      // Allow older schemas that don't yet have current_team_id / created_by.
      if (err?.number === 207) {
        const playerResult = await createPlayerReq.query<{ player_id: number }>(`
          INSERT INTO players (
            full_name,
            display_name,
            date_of_birth,
            nationality,
            preferred_position
          )
          OUTPUT INSERTED.player_id
          VALUES (
            @full_name,
            @full_name,
            @date_of_birth,
            @nationality,
            @preferred_position
          )
        `);
        playerId = Number(playerResult.recordset[0]?.player_id);
      } else {
        throw err;
      }
    }

    if (!playerId || Number.isNaN(playerId)) {
      throw BadRequestError("Failed to create player");
    }

    await registerPlayerForSeason(
      {
        season_id: input.seasonId,
        player_id: playerId,
        season_team_id: input.seasonTeamId,
        position_code: positionCode,
        shirt_number: input.shirtNumber ?? undefined,
        player_type: playerType as any,
        file_path: input.filePath,
        user_id: input.actorId ?? null,
        username: input.actorUsername ?? null,
      },
      tx
    );

    return { playerId };
  });
}

export async function updatePlayerRegistration(id: number, input: UpdatePlayerRegistrationInput) {
  if (!id || Number.isNaN(Number(id))) {
    throw BadRequestError("Invalid registration id");
  }

  return transaction(async (tx) => {
    const checkReq = new sql.Request(tx);
    checkReq.input("id", sql.Int, id);

    const existingResult = await checkReq.query<{
      player_id: number;
      registration_status: string;
      season_team_id: number;
      team_id: number;
    }>(`
      SELECT
        spr.player_id,
        spr.registration_status,
        spr.season_team_id,
        stp.team_id
      FROM season_player_registrations spr
      JOIN season_team_participants stp ON spr.season_team_id = stp.season_team_id
      WHERE spr.season_player_id = @id
    `);

    const existing = existingResult.recordset[0];
    if (!existing) {
      throw BadRequestError("Registration not found");
    }

    if (String(existing.registration_status).toLowerCase() !== "pending") {
      throw BadRequestError("Registration is not pending");
    }

    if (Array.isArray(input.scopedTeamIds) && !input.scopedTeamIds.includes(Number(existing.team_id))) {
      throw ForbiddenError("You are not allowed to update registrations for this team");
    }

    const hasPlayerUpdates =
      input.fullName !== undefined ||
      input.dateOfBirth !== undefined ||
      input.nationality !== undefined ||
      input.positionCode !== undefined;

    if (hasPlayerUpdates) {
      const playerReq = new sql.Request(tx);
      playerReq.input("playerId", sql.Int, Number(existing.player_id));
      playerReq.input("updatedBy", sql.Int, input.actorId ?? null);
      playerReq.input(
        "full_name",
        sql.NVarChar(255),
        input.fullName !== undefined ? String(input.fullName).trim() : null
      );
      playerReq.input(
        "date_of_birth",
        sql.Date,
        input.dateOfBirth !== undefined ? new Date(input.dateOfBirth) : null
      );
      playerReq.input(
        "nationality",
        sql.NVarChar(100),
        input.nationality !== undefined && input.nationality !== null
          ? String(input.nationality).trim()
          : input.nationality === null
          ? null
          : null
      );
      playerReq.input(
        "preferred_position",
        sql.NVarChar(50),
        input.positionCode !== undefined ? String(input.positionCode).trim() : null
      );

      try {
        await playerReq.query(`
          UPDATE players
          SET
            full_name = COALESCE(@full_name, full_name),
            display_name = COALESCE(@full_name, display_name),
            date_of_birth = COALESCE(@date_of_birth, date_of_birth),
            nationality = COALESCE(@nationality, nationality),
            preferred_position = COALESCE(@preferred_position, preferred_position),
            updated_at = SYSUTCDATETIME(),
            updated_by = @updatedBy
          WHERE player_id = @playerId;
        `);
      } catch (err: any) {
        // Allow older schemas that don't yet have updated_at/updated_by.
        if (err?.number === 207) {
          await playerReq.query(`
            UPDATE players
            SET
              full_name = COALESCE(@full_name, full_name),
              display_name = COALESCE(@full_name, display_name),
              date_of_birth = COALESCE(@date_of_birth, date_of_birth),
              nationality = COALESCE(@nationality, nationality),
              preferred_position = COALESCE(@preferred_position, preferred_position)
            WHERE player_id = @playerId;
          `);
        } else {
          throw err;
        }
      }
    }

    const hasRegUpdates =
      input.positionCode !== undefined ||
      input.shirtNumber !== undefined ||
      input.playerType !== undefined ||
      input.filePath !== undefined;

    if (hasRegUpdates) {
      const regReq = new sql.Request(tx);
      regReq.input("id", sql.Int, id);
      regReq.input(
        "position_code",
        sql.NVarChar(50),
        input.positionCode !== undefined ? String(input.positionCode).trim() : null
      );
      regReq.input("has_shirt_number", sql.Bit, input.shirtNumber !== undefined ? 1 : 0);
      regReq.input(
        "shirt_number",
        sql.Int,
        input.shirtNumber !== undefined ? input.shirtNumber : null
      );
      regReq.input(
        "player_type",
        sql.NVarChar(50),
        input.playerType !== undefined ? String(input.playerType).trim().toLowerCase() : null
      );
      regReq.input(
        "file_path",
        sql.NVarChar(255),
        input.filePath !== undefined ? input.filePath : null
      );
      regReq.input(
        "is_foreign",
        sql.Bit,
        input.playerType !== undefined
          ? String(input.playerType).trim().toLowerCase() === "foreign"
            ? 1
            : 0
          : null
      );

      await regReq.query(`
        UPDATE season_player_registrations
        SET
          position_code = COALESCE(@position_code, position_code),
          shirt_number = CASE WHEN @has_shirt_number = 1 THEN @shirt_number ELSE shirt_number END,
          player_type = COALESCE(@player_type, player_type),
          is_foreign = COALESCE(@is_foreign, is_foreign),
          file_path = COALESCE(@file_path, file_path)
        WHERE season_player_id = @id;
      `);
    }
  });
}
