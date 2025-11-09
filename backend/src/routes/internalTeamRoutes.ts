import { Router } from "express";
import { query } from "../db/sqlServer";
import { getInternalSeasons } from "../services/seasonService";

const router = Router();

/**
 * GET /internal/teams - Get teams from internal database (not Football* tables)
 */
router.get("/", async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 25;
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params: Record<string, unknown> = { offset, limit };

    if (search) {
      whereClause = "WHERE name LIKE @search OR short_name LIKE @search OR code LIKE @search";
      params.search = `%${search}%`;
    }

    const teamsResult = await query<{
      team_id: number;
      name: string;
      short_name: string | null;
      code: string | null;
      governing_body: string | null;
      city: string | null;
      country: string | null;
      home_stadium_id: number | null;
      founded_year: number | null;
      description: string | null;
      home_kit_description: string | null;
      status: string;
    }>(
      `
        SELECT 
          team_id,
          name,
          short_name,
          code,
          governing_body,
          city,
          country,
          home_stadium_id,
          founded_year,
          description,
          home_kit_description,
          status
        FROM teams
        ${whereClause}
        ORDER BY name
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
      `,
      params,
    );

    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM teams ${whereClause};`,
      params,
    );

    const total = countResult.recordset[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: teamsResult.recordset,
      total,
      pagination: {
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/seasons", async (_req, res, next) => {
  try {
    const seasons = await getInternalSeasons();
    res.json({ data: seasons });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /internal/teams/:id - Get team by internal ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const teamId = parseInt(req.params.id, 10);
    if (isNaN(teamId)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    const result = await query<{
      team_id: number;
      name: string;
      short_name: string | null;
      code: string | null;
      governing_body: string | null;
      city: string | null;
      country: string | null;
      home_stadium_id: number | null;
      founded_year: number | null;
      description: string | null;
      home_kit_description: string | null;
      status: string;
    }>(
      `
        SELECT 
          team_id,
          name,
          short_name,
          code,
          governing_body,
          city,
          country,
          home_stadium_id,
          founded_year,
          description,
          home_kit_description,
          status
        FROM teams
        WHERE team_id = @teamId;
      `,
      { teamId },
    );

    const team = result.recordset[0];
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json({ data: team });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /internal/teams/:id/players - Get players of a team
 */
router.get("/:id/players", async (req, res, next) => {
  try {
    const teamId = parseInt(req.params.id, 10);
    if (isNaN(teamId)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    const result = await query<{
      player_id: number;
      full_name: string;
      display_name: string | null;
      date_of_birth: string;
      place_of_birth: string | null;
      nationality: string;
      preferred_position: string | null;
      secondary_position: string | null;
      height_cm: number | null;
      weight_kg: number | null;
      dominant_foot: string | null;
      current_team_id: number | null;
    }>(
      `
        SELECT 
          player_id,
          full_name,
          display_name,
          CONVERT(VARCHAR(10), date_of_birth, 23) as date_of_birth,
          place_of_birth,
          nationality,
          preferred_position,
          secondary_position,
          height_cm,
          weight_kg,
          dominant_foot,
          current_team_id
        FROM players
        WHERE current_team_id = @teamId
        ORDER BY full_name;
      `,
      { teamId },
    );

    res.json({
      data: result.recordset,
      total: result.recordset.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /internal/teams/:id - Update team
 */
router.put("/:id", async (req, res, next) => {
  try {
    const teamId = parseInt(req.params.id, 10);
    if (isNaN(teamId)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    const { name, short_name, code, city, country, founded_year } = req.body;

    await query(
      `
        UPDATE teams
        SET 
          name = COALESCE(@name, name),
          short_name = @short_name,
          code = @code,
          city = @city,
          country = @country,
          founded_year = @founded_year
        WHERE team_id = @teamId;
      `,
      {
        teamId,
        name: name || null,
        short_name: short_name || null,
        code: code || null,
        city: city || null,
        country: country || null,
        founded_year: founded_year || null,
      },
    );

    // Return updated team
    const result = await query<{
      team_id: number;
      name: string;
      short_name: string | null;
      code: string | null;
      city: string | null;
      country: string | null;
      founded_year: number | null;
    }>(
      `
        SELECT team_id, name, short_name, code, city, country, founded_year
        FROM teams
        WHERE team_id = @teamId;
      `,
      { teamId },
    );

    const team = result.recordset[0];
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json({ data: team });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /internal/teams/:id - Delete team
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const teamId = parseInt(req.params.id, 10);
    if (isNaN(teamId)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    await query(
      `
        DELETE FROM teams
        WHERE team_id = @teamId;
      `,
      { teamId },
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

