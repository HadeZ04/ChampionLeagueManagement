import { query } from "../db/sqlServer";
import { PlayerSummary, TeamDetail, getCompetitionTeams, getTeamDetail } from "./footballDataService";

export interface PlayerRecord {
  id: number;
  externalId: number | null;
  externalKey: string;
  name: string;
  position: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  shirtNumber: number | null;
  teamExternalId: number;
  teamName: string;
  teamShortName: string | null;
  teamTla: string | null;
  season: string | null;
  updatedAt: string;
}

export interface PlayerFilters {
  search?: string;
  teamId?: number;
  position?: string;
  nationality?: string;
  season?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedPlayers {
  data: PlayerRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type UpsertPlayerInput = {
  player: PlayerSummary;
  team: TeamDetail;
  season?: string | null;
};

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const buildPlayerExternalKey = (payload: UpsertPlayerInput["player"], teamId: number): string => {
  if (payload.id) {
    return String(payload.id);
  }
  const normalizedName = payload.name.trim().toLowerCase();
  const dob = payload.dateOfBirth ?? "unknown";
  return `${teamId}:${normalizedName}:${dob}`;
};

const upsertPlayer = async ({ player, team, season }: UpsertPlayerInput): Promise<void> => {
  const externalKey = buildPlayerExternalKey(player, team.id);
  await query(
    `
      MERGE dbo.FootballPlayers AS target
      USING (VALUES (@externalKey)) AS source(external_key)
      ON target.external_key = source.external_key
      WHEN MATCHED THEN
        UPDATE SET
          target.external_id = @externalId,
          target.name = @name,
          target.position = @position,
          target.nationality = @nationality,
          target.date_of_birth = @dateOfBirth,
          target.shirt_number = @shirtNumber,
          target.team_external_id = @teamExternalId,
          target.team_name = @teamName,
          target.team_short_name = @teamShortName,
          target.team_tla = @teamTla,
          target.season = @season,
          target.updated_at = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (
          external_id,
          external_key,
          name,
          position,
          nationality,
          date_of_birth,
          shirt_number,
          team_external_id,
          team_name,
          team_short_name,
          team_tla,
          season
        )
        VALUES (
          @externalId,
          @externalKey,
          @name,
          @position,
          @nationality,
          @dateOfBirth,
          @shirtNumber,
          @teamExternalId,
          @teamName,
          @teamShortName,
          @teamTla,
          @season
        );
    `,
    {
      externalId: player.id ?? null,
      externalKey,
      name: player.name,
      position: player.position ?? null,
      nationality: player.nationality ?? null,
      dateOfBirth: player.dateOfBirth ?? null,
      shirtNumber: player.shirtNumber ?? null,
      teamExternalId: team.id,
      teamName: team.name,
      teamShortName: team.shortName ?? null,
      teamTla: team.tla ?? null,
      season: season ?? team.season ?? null,
    },
  );
};

export const syncPlayersFromUpstream = async (season?: string): Promise<{
  season: string | undefined;
  totalTeams: number;
  totalPlayers: number;
}> => {
  const teams = await getCompetitionTeams(season);
  let totalPlayers = 0;

  for (const teamSummary of teams) {
    const teamDetail = await getTeamDetail(teamSummary.id, season);
    for (const player of teamDetail.squad) {
      await upsertPlayer({
        player,
        team: teamDetail,
        season,
      });
    }
    totalPlayers += teamDetail.squad.length;
  }

  return {
    season,
    totalTeams: teams.length,
    totalPlayers,
  };
};

export const listPlayers = async (filters: PlayerFilters = {}): Promise<PaginatedPlayers> => {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit
    ? Math.min(Math.max(filters.limit, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const parameters: Record<string, unknown> = {
    offset,
    limit,
  };

  if (filters.search) {
    conditions.push(
      "(LOWER(name) LIKE LOWER(@search) OR LOWER(team_name) LIKE LOWER(@search) OR LOWER(team_tla) LIKE LOWER(@search))",
    );
    parameters.search = `%${filters.search.trim()}%`;
  }

  if (filters.teamId) {
    conditions.push("team_external_id = @teamId");
    parameters.teamId = filters.teamId;
  }

  if (filters.position) {
    conditions.push("LOWER(position) = LOWER(@position)");
    parameters.position = filters.position.trim();
  }

  if (filters.nationality) {
    conditions.push("LOWER(nationality) = LOWER(@nationality)");
    parameters.nationality = filters.nationality.trim();
  }

  if (filters.season) {
    conditions.push("season = @season");
    parameters.season = filters.season.trim();
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataResult = await query<PlayerRecord>(
    `
      SELECT
        id,
        external_id AS externalId,
        external_key AS externalKey,
        name,
        position,
        nationality,
        CONVERT(VARCHAR(10), date_of_birth, 23) AS dateOfBirth,
        shirt_number AS shirtNumber,
        team_external_id AS teamExternalId,
        team_name AS teamName,
        team_short_name AS teamShortName,
        team_tla AS teamTla,
        season,
        COALESCE(CONVERT(VARCHAR(33), updated_at, 127), CONVERT(VARCHAR(33), created_at, 127)) AS updatedAt
      FROM dbo.FootballPlayers
      ${whereClause}
      ORDER BY name ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `,
    parameters,
  );

  const countResult = await query<{ total: number }>(
    `
      SELECT COUNT(1) AS total
      FROM dbo.FootballPlayers
      ${whereClause};
    `,
    parameters,
  );

  const total = countResult.recordset[0]?.total ?? 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  return {
    data: dataResult.recordset,
    total,
    page,
    limit,
    totalPages,
  };
};

export const getPlayerById = async (id: number): Promise<PlayerRecord | null> => {
  const result = await query<PlayerRecord>(
    `
      SELECT
        id,
        external_id AS externalId,
        external_key AS externalKey,
        name,
        position,
        nationality,
        CONVERT(VARCHAR(10), date_of_birth, 23) AS dateOfBirth,
        shirt_number AS shirtNumber,
        team_external_id AS teamExternalId,
        team_name AS teamName,
        team_short_name AS teamShortName,
        team_tla AS teamTla,
        season,
        COALESCE(CONVERT(VARCHAR(33), updated_at, 127), CONVERT(VARCHAR(33), created_at, 127)) AS updatedAt
      FROM dbo.FootballPlayers
      WHERE id = @id;
    `,
    { id },
  );

  return result.recordset[0] ?? null;
};

export const updatePlayer = async (
  id: number,
  payload: Partial<Pick<PlayerRecord, "position" | "shirtNumber" | "nationality" | "season" | "name">>,
): Promise<PlayerRecord | null> => {
  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  if (payload.name) {
    fields.push("name = @name");
    params.name = payload.name.trim();
  }
  if (payload.position !== undefined) {
    fields.push("position = @position");
    params.position = payload.position ? payload.position.trim() : null;
  }
  if (payload.nationality !== undefined) {
    fields.push("nationality = @nationality");
    params.nationality = payload.nationality ? payload.nationality.trim() : null;
  }
  if (payload.shirtNumber !== undefined) {
    fields.push("shirt_number = @shirtNumber");
    params.shirtNumber = payload.shirtNumber ?? null;
  }
  if (payload.season !== undefined) {
    fields.push("season = @season");
    params.season = payload.season ?? null;
  }

  if (fields.length === 0) {
    return getPlayerById(id);
  }

  fields.push("updated_at = SYSUTCDATETIME()");

  await query(
    `
      UPDATE dbo.FootballPlayers
      SET ${fields.join(", ")}
      WHERE id = @id;
    `,
    params,
  );

  return getPlayerById(id);
};

export const deletePlayer = async (id: number): Promise<boolean> => {
  const result = await query<{ rowsAffected: number }>(
    "DELETE FROM dbo.FootballPlayers WHERE id = @id;",
    { id },
  );
  const rowsAffected = result.rowsAffected?.[0] ?? 0;
  return rowsAffected > 0;
};


