import { query } from "../db/sqlServer";

interface SqlError extends Error {
  number?: number;
}

function isMissingSeasonTableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }
  return (error as SqlError).number === 208;
}

interface SeasonRow {
  season_id: number;
  name: string;
  code: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface SeasonSummary {
  seasonId: number;
  name: string;
  code: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
}

export async function listSeasons(): Promise<SeasonSummary[]> {
  try {
    const result = await query<SeasonRow>(
      `SELECT season_id,
              name,
              code,
              status,
              start_date,
              end_date
       FROM seasons
       ORDER BY start_date DESC, season_id DESC`
    );

    return result.recordset.map((row) => ({
      seasonId: row.season_id,
      name: row.name,
      code: row.code,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
    }));
  } catch (error) {
    if (isMissingSeasonTableError(error)) {
      return [];
    }
    throw error;
  }
}
