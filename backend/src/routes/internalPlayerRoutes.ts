import { Router } from "express";
import { query } from "../db/sqlServer";
import { createPlayerHandler } from "../controllers/internalPlayerController";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";

const router = Router();

/**
 * POST /internal/players - Create a new player
 */
router.post("/", requireAuth, requirePermission("manage_teams"), createPlayerHandler);


router.get("/", async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const teamId = typeof req.query.teamId === "string" ? parseInt(req.query.teamId, 10) : null;
    const position = typeof req.query.position === "string" ? req.query.position.trim() : "";
    const nationality = typeof req.query.nationality === "string" ? req.query.nationality.trim() : "";
    const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 25;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: Record<string, unknown> = { offset, limit };

    if (search) {
      conditions.push("(LOWER(full_name) LIKE LOWER(@search) OR LOWER(display_name) LIKE LOWER(@search))");
      params.search = `%${search}%`;
    }

    if (teamId && !isNaN(teamId)) {
      conditions.push("current_team_id = @teamId");
      params.teamId = teamId;
    }

    if (position) {
      conditions.push("LOWER(preferred_position) LIKE LOWER(@position)");
      params.position = `%${position}%`;
    }

    if (nationality) {
      conditions.push("LOWER(nationality) = LOWER(@nationality)");
      params.nationality = nationality;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const playersResult = await query<{
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
      team_name: string | null;
    }>(
      `
        SELECT 
          p.player_id,
          p.full_name,
          p.display_name,
          CONVERT(VARCHAR(10), p.date_of_birth, 23) as date_of_birth,
          p.place_of_birth,
          p.nationality,
          p.preferred_position,
          p.secondary_position,
          p.height_cm,
          p.weight_kg,
          p.dominant_foot,
          p.current_team_id,
          t.name as team_name
        FROM players p
        LEFT JOIN teams t ON p.current_team_id = t.team_id
        ${whereClause}
        ORDER BY p.full_name
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
      `,
      params,
    );

    const countResult = await query<{ total: number }>(
      `
        SELECT COUNT(*) as total
        FROM players p
        ${whereClause};
      `,
      params,
    );

    const total = countResult.recordset[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: playersResult.recordset,
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

/**
 * GET /internal/players/:id - Get player by internal ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const playerId = parseInt(req.params.id, 10);
    if (isNaN(playerId)) {
      return res.status(400).json({ error: "Invalid player ID" });
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
      biography: string | null;
      dominant_foot: string | null;
      current_team_id: number | null;
      team_name: string | null;
    }>(
      `
        SELECT 
          p.player_id,
          p.full_name,
          p.display_name,
          CONVERT(VARCHAR(10), p.date_of_birth, 23) as date_of_birth,
          p.place_of_birth,
          p.nationality,
          p.preferred_position,
          p.secondary_position,
          p.height_cm,
          p.weight_kg,
          p.biography,
          p.dominant_foot,
          p.current_team_id,
          t.name as team_name
        FROM players p
        LEFT JOIN teams t ON p.current_team_id = t.team_id
        WHERE p.player_id = @playerId;
      `,
      { playerId },
    );

    const player = result.recordset[0];
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json({ data: player });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /internal/players/:id - Update player
 */
router.put("/:id", requireAuth, requirePermission("manage_teams"), async (req, res, next) => {
  try {
    const playerId = parseInt(req.params.id, 10);
    if (isNaN(playerId)) {
      return res.status(400).json({ error: "Invalid player ID" });
    }

    const { name, position, nationality } = req.body;

    await query(
      `
        UPDATE players
        SET 
          full_name = COALESCE(@name, full_name),
          display_name = COALESCE(@name, display_name),
          preferred_position = @position,
          nationality = @nationality
        WHERE player_id = @playerId;
      `,
      {
        playerId,
        name: name || null,
        position: position || null,
        nationality: nationality || null,
      },
    );

    // Return updated player
    const result = await query<{
      player_id: number;
      full_name: string;
      preferred_position: string | null;
      nationality: string | null;
    }>(
      `
        SELECT player_id, full_name, preferred_position, nationality
        FROM players
        WHERE player_id = @playerId;
      `,
      { playerId },
    );

    const player = result.recordset[0];
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json({ data: player });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /internal/players/:id - Delete player
 */
router.delete("/:id", requireAuth, requirePermission("manage_teams"), async (req, res, next) => {
  try {
    const playerId = parseInt(req.params.id, 10);
    if (isNaN(playerId)) {
      return res.status(400).json({ error: "Invalid player ID" });
    }

    await query(
      `
        DELETE FROM players
        WHERE player_id = @playerId;
      `,
      { playerId },
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
