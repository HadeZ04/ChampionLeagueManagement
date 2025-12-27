import { query } from "../db/sqlServer";

export interface MatchReport {
  report_id: number;
  match_id: number;
  reported_by_user_id: number;
  reported_by_name: string;
  attendance: number | null;
  weather_condition: string | null;
  match_summary: string | null;
  incidents: string | null;
  injuries_reported: string | null;
  referee_notes: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string | null;
}

const baseReportSelect = `
  SELECT
    mr.report_id,
    mr.match_id,
    mr.reported_by_user_id,
    u.username AS reported_by_name,
    mr.attendance,
    mr.weather_condition,
    mr.match_summary,
    mr.incidents,
    mr.injuries_reported,
    mr.referee_notes,
    CONVERT(VARCHAR(23), mr.submitted_at, 126) AS submitted_at,
    CONVERT(VARCHAR(23), mr.created_at, 126) AS created_at,
    CONVERT(VARCHAR(23), mr.updated_at, 126) AS updated_at
  FROM match_reports mr
  INNER JOIN users u ON mr.reported_by_user_id = u.user_id
`;

/**
 * Create a new match report
 */
export async function createMatchReport(
  matchId: number,
  reportedByUserId: number,
  reportData: {
    attendance?: number;
    weather_condition?: string;
    match_summary?: string;
    incidents?: string;
    injuries_reported?: string;
    referee_notes?: string;
  }
): Promise<MatchReport> {
  const result = await query<MatchReport>(
    `
    INSERT INTO match_reports (
      match_id, reported_by_user_id, attendance, weather_condition,
      match_summary, incidents, injuries_reported, referee_notes,
      submitted_at, created_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @matchId, @reportedByUserId, @attendance, @weatherCondition,
      @matchSummary, @incidents, @injuriesReported, @refereeNotes,
      GETUTCDATE(), GETUTCDATE()
    )
  `,
    {
      matchId,
      reportedByUserId,
      attendance: reportData.attendance || null,
      weatherCondition: reportData.weather_condition || null,
      matchSummary: reportData.match_summary || null,
      incidents: reportData.incidents || null,
      injuriesReported: reportData.injuries_reported || null,
      refereeNotes: reportData.referee_notes || null,
    }
  );

  return result.recordset[0];
}

/**
 * Get report for a match
 */
export async function getMatchReport(matchId: number): Promise<MatchReport | null> {
  const result = await query<MatchReport>(
    `${baseReportSelect} WHERE mr.match_id = @matchId`,
    { matchId }
  );
  return result.recordset[0] || null;
}

/**
 * Get all reports by an official/referee
 */
export async function getReportsByOfficial(officialId: number): Promise<MatchReport[]> {
  const result = await query<MatchReport>(
    `${baseReportSelect} WHERE mr.reported_by_user_id = @officialId ORDER BY mr.submitted_at DESC`,
    { officialId }
  );
  return result.recordset;
}

/**
 * Update match report
 */
export async function updateMatchReport(
  reportId: number,
  updates: Partial<MatchReport>
): Promise<MatchReport | null> {
  const fields: string[] = [];
  const params: Record<string, unknown> = { reportId };

  if (updates.attendance !== undefined) {
    fields.push("attendance = @attendance");
    params.attendance = updates.attendance;
  }
  if (updates.weather_condition !== undefined) {
    fields.push("weather_condition = @weatherCondition");
    params.weatherCondition = updates.weather_condition;
  }
  if (updates.match_summary !== undefined) {
    fields.push("match_summary = @matchSummary");
    params.matchSummary = updates.match_summary;
  }
  if (updates.incidents !== undefined) {
    fields.push("incidents = @incidents");
    params.incidents = updates.incidents;
  }
  if (updates.injuries_reported !== undefined) {
    fields.push("injuries_reported = @injuriesReported");
    params.injuriesReported = updates.injuries_reported;
  }
  if (updates.referee_notes !== undefined) {
    fields.push("referee_notes = @refereeNotes");
    params.refereeNotes = updates.referee_notes;
  }

  if (fields.length === 0) {
    return getReportById(reportId);
  }

  fields.push("updated_at = GETUTCDATE()");

  const result = await query<MatchReport>(
    `
    UPDATE match_reports
    SET ${fields.join(", ")}
    OUTPUT INSERTED.*
    WHERE report_id = @reportId
  `,
    params
  );

  return result.recordset[0] || null;
}

/**
 * Get report by ID
 */
export async function getReportById(reportId: number): Promise<MatchReport | null> {
  const result = await query<MatchReport>(
    `${baseReportSelect} WHERE mr.report_id = @reportId`,
    { reportId }
  );
  return result.recordset[0] || null;
}

/**
 * Delete match report
 */
export async function deleteMatchReport(reportId: number): Promise<void> {
  await query(
    `DELETE FROM match_reports WHERE report_id = @reportId`,
    { reportId }
  );
}

/**
 * Get incidents summary for a season
 */
export async function getSeasonIncidents(seasonId: number): Promise<
  Array<{
    match_id: number;
    incident_type: string;
    description: string;
    submitted_at: string;
  }>
> {
  const result = await query(
    `
    SELECT mr.match_id, 'incident' as incident_type, mr.incidents as description, mr.submitted_at
    FROM match_reports mr
    INNER JOIN matches m ON mr.match_id = m.match_id
    INNER JOIN seasons s ON m.season_id = s.season_id
    WHERE s.season_id = @seasonId AND mr.incidents IS NOT NULL
    ORDER BY mr.submitted_at DESC
  `,
    { seasonId }
  );

  return result.recordset;
}

/**
 * Get injury reports for a season
 */
export async function getSeasonInjuries(seasonId: number): Promise<
  Array<{
    match_id: number;
    injuries: string;
    submitted_at: string;
  }>
> {
  const result = await query(
    `
    SELECT mr.match_id, mr.injuries_reported as injuries, mr.submitted_at
    FROM match_reports mr
    INNER JOIN matches m ON mr.match_id = m.match_id
    INNER JOIN seasons s ON m.season_id = s.season_id
    WHERE s.season_id = @seasonId AND mr.injuries_reported IS NOT NULL
    ORDER BY mr.submitted_at DESC
  `,
    { seasonId }
  );

  return result.recordset;
}
