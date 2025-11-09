import { query } from "../db/sqlServer";
import {
  CompetitionStandings,
  CompetitionStandingRow,
  getCompetitionStandings,
} from "./footballDataService";

export interface StandingRecord {
  id: number;
  season: string;
  seasonYear: number;
  seasonLabel: string;
  seasonStartDate: string | null;
  seasonEndDate: string | null;
  position: number;
  teamId: number;
  teamName: string;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string | null;
  status: string | null;
  updatedAt: string;
}

export interface StandingsFilters {
  season?: string;
  teamId?: number;
  status?: string;
}

export interface StandingsResponse {
  season: {
    year: number;
    label: string;
    startDate: string;
    endDate: string;
  };
  updated: string;
  table: StandingRecord[];
}

const upsertStanding = async (
  standing: CompetitionStandingRow,
  seasonInfo: CompetitionStandings["season"],
): Promise<void> => {
  // Convert season year to string (e.g., "2024-2025")
  const seasonString = seasonInfo.label || `${seasonInfo.year}-${seasonInfo.year + 1}`;

  await query(
    `
      MERGE dbo.FootballStandings AS target
      USING (VALUES (@season, @teamId)) AS source(season, team_id)
      ON target.season = source.season AND target.team_id = source.team_id
      WHEN MATCHED THEN
        UPDATE SET
          target.season_year = @seasonYear,
          target.season_label = @seasonLabel,
          target.season_start_date = @seasonStartDate,
          target.season_end_date = @seasonEndDate,
          target.position = @position,
          target.team_name = @teamName,
          target.short_name = @shortName,
          target.tla = @tla,
          target.crest = @crest,
          target.played = @played,
          target.won = @won,
          target.draw = @draw,
          target.lost = @lost,
          target.goals_for = @goalsFor,
          target.goals_against = @goalsAgainst,
          target.goal_difference = @goalDifference,
          target.points = @points,
          target.form = @form,
          target.status = @status,
          target.updated_at = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (
          season,
          season_year,
          season_label,
          season_start_date,
          season_end_date,
          position,
          team_id,
          team_name,
          short_name,
          tla,
          crest,
          played,
          won,
          draw,
          lost,
          goals_for,
          goals_against,
          goal_difference,
          points,
          form,
          status
        )
        VALUES (
          @season,
          @seasonYear,
          @seasonLabel,
          @seasonStartDate,
          @seasonEndDate,
          @position,
          @teamId,
          @teamName,
          @shortName,
          @tla,
          @crest,
          @played,
          @won,
          @draw,
          @lost,
          @goalsFor,
          @goalsAgainst,
          @goalDifference,
          @points,
          @form,
          @status
        );
    `,
    {
      season: seasonString,
      seasonYear: seasonInfo.year,
      seasonLabel: seasonInfo.label,
      seasonStartDate: seasonInfo.startDate || null,
      seasonEndDate: seasonInfo.endDate || null,
      position: standing.position,
      teamId: standing.teamId,
      teamName: standing.teamName,
      shortName: standing.shortName ?? null,
      tla: standing.tla ?? null,
      crest: standing.crest ?? null,
      played: standing.played,
      won: standing.won,
      draw: standing.draw,
      lost: standing.lost,
      goalsFor: standing.goalsFor,
      goalsAgainst: standing.goalsAgainst,
      goalDifference: standing.goalDifference,
      points: standing.points,
      form: standing.form?.join(",") ?? null,
      status: standing.status ?? null,
    },
  );
};

export const syncStandingsFromUpstream = async (season?: string): Promise<{
  season: string | undefined;
  totalRows: number;
}> => {
  const standings = await getCompetitionStandings(season);

  for (const row of standings.table) {
    await upsertStanding(row, standings.season);
  }

  return {
    season,
    totalRows: standings.table.length,
  };
};

export const getStandings = async (filters: StandingsFilters = {}): Promise<StandingsResponse> => {
  const conditions: string[] = [];
  const parameters: Record<string, unknown> = {};

  if (filters.season) {
    conditions.push("season = @season");
    parameters.season = filters.season.trim();
  }

  if (filters.teamId) {
    conditions.push("team_id = @teamId");
    parameters.teamId = filters.teamId;
  }

  if (filters.status) {
    conditions.push("LOWER(status) = LOWER(@status)");
    parameters.status = filters.status.trim();
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // If no season specified, get the latest season
  let targetSeason = filters.season;
  if (!targetSeason) {
    const latestSeasonResult = await query<{ season: string }>(
      `
        SELECT TOP 1 season
        FROM dbo.FootballStandings
        ORDER BY season_year DESC, season DESC;
      `,
    );
    targetSeason = latestSeasonResult.recordset[0]?.season;
    if (!targetSeason) {
      // No data in database
      return {
        season: {
          year: new Date().getFullYear(),
          label: "",
          startDate: "",
          endDate: "",
        },
        updated: new Date().toISOString(),
        table: [],
      };
    }
    parameters.season = targetSeason;
    if (conditions.length === 0) {
      conditions.push("season = @season");
    }
  }

  const dataResult = await query<StandingRecord>(
    `
      SELECT
        id,
        season,
        season_year AS seasonYear,
        season_label AS seasonLabel,
        CONVERT(VARCHAR(10), season_start_date, 23) AS seasonStartDate,
        CONVERT(VARCHAR(10), season_end_date, 23) AS seasonEndDate,
        position,
        team_id AS teamId,
        team_name AS teamName,
        short_name AS shortName,
        tla,
        crest,
        played,
        won,
        draw,
        lost,
        goals_for AS goalsFor,
        goals_against AS goalsAgainst,
        goal_difference AS goalDifference,
        points,
        form,
        status,
        CONVERT(VARCHAR(33), updated_at, 127) AS updatedAt
      FROM dbo.FootballStandings
      ${whereClause}
      ORDER BY position ASC;
    `,
    parameters,
  );

  // Get season info from first row
  const firstRow = dataResult.recordset[0];
  const seasonInfo = firstRow
    ? {
        year: firstRow.seasonYear,
        label: firstRow.seasonLabel,
        startDate: firstRow.seasonStartDate || "",
        endDate: firstRow.seasonEndDate || "",
      }
    : {
        year: new Date().getFullYear(),
        label: "",
        startDate: "",
        endDate: "",
      };

  const updated =
    dataResult.recordset.length > 0
      ? dataResult.recordset[0].updatedAt
      : new Date().toISOString();

  return {
    season: seasonInfo,
    updated,
    table: dataResult.recordset,
  };
};

export const getStandingById = async (id: number): Promise<StandingRecord | null> => {
  const result = await query<StandingRecord>(
    `
      SELECT
        id,
        season,
        season_year AS seasonYear,
        season_label AS seasonLabel,
        CONVERT(VARCHAR(10), season_start_date, 23) AS seasonStartDate,
        CONVERT(VARCHAR(10), season_end_date, 23) AS seasonEndDate,
        position,
        team_id AS teamId,
        team_name AS teamName,
        short_name AS shortName,
        tla,
        crest,
        played,
        won,
        draw,
        lost,
        goals_for AS goalsFor,
        goals_against AS goalsAgainst,
        goal_difference AS goalDifference,
        points,
        form,
        status,
        CONVERT(VARCHAR(33), updated_at, 127) AS updatedAt
      FROM dbo.FootballStandings
      WHERE id = @id;
    `,
    { id },
  );

  return result.recordset[0] ?? null;
};

export const updateStanding = async (
  id: number,
  payload: Partial<
    Pick<
      StandingRecord,
      | "position"
      | "played"
      | "won"
      | "draw"
      | "lost"
      | "goalsFor"
      | "goalsAgainst"
      | "goalDifference"
      | "points"
      | "form"
      | "status"
    >
  >,
): Promise<StandingRecord | null> => {
  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  if (payload.position !== undefined) {
    fields.push("position = @position");
    params.position = payload.position;
  }
  if (payload.played !== undefined) {
    fields.push("played = @played");
    params.played = payload.played;
  }
  if (payload.won !== undefined) {
    fields.push("won = @won");
    params.won = payload.won;
  }
  if (payload.draw !== undefined) {
    fields.push("draw = @draw");
    params.draw = payload.draw;
  }
  if (payload.lost !== undefined) {
    fields.push("lost = @lost");
    params.lost = payload.lost;
  }
  if (payload.goalsFor !== undefined) {
    fields.push("goals_for = @goalsFor");
    params.goalsFor = payload.goalsFor;
  }
  if (payload.goalsAgainst !== undefined) {
    fields.push("goals_against = @goalsAgainst");
    params.goalsAgainst = payload.goalsAgainst;
  }
  if (payload.goalDifference !== undefined) {
    fields.push("goal_difference = @goalDifference");
    params.goalDifference = payload.goalDifference;
  }
  if (payload.points !== undefined) {
    fields.push("points = @points");
    params.points = payload.points;
  }
  if (payload.form !== undefined) {
    fields.push("form = @form");
    params.form = payload.form ?? null;
  }
  if (payload.status !== undefined) {
    fields.push("status = @status");
    params.status = payload.status ?? null;
  }

  if (fields.length === 0) {
    return getStandingById(id);
  }

  fields.push("updated_at = SYSUTCDATETIME()");

  await query(
    `
      UPDATE dbo.FootballStandings
      SET ${fields.join(", ")}
      WHERE id = @id;
    `,
    params,
  );

  return getStandingById(id);
};

export const deleteStanding = async (id: number): Promise<boolean> => {
  const result = await query<{ rowsAffected: number }>(
    "DELETE FROM dbo.FootballStandings WHERE id = @id;",
    { id },
  );
  const rowsAffected = result.rowsAffected?.[0] ?? 0;
  return rowsAffected > 0;
};

export const deleteStandingsBySeason = async (season: string): Promise<number> => {
  const result = await query<{ rowsAffected: number }>(
    "DELETE FROM dbo.FootballStandings WHERE season = @season;",
    { season },
  );
  return result.rowsAffected?.[0] ?? 0;
};

