import { Router } from "express";
import { query } from "../db/sqlServer";
import { createPlayerHandler } from "../controllers/internalPlayerController";
import { requireAnyPermission, requireAuth, requirePermission } from "../middleware/authMiddleware";

const router = Router();

/**
 * POST /internal/players - Create a new player
 * Handled by controller, verified in service.
 */
router.post("/", requireAuth, requireAnyPermission("manage_own_player_registrations", "manage_teams"), createPlayerHandler);


router.get("/", async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const teamId = typeof req.query.teamId === "string" ? parseInt(req.query.teamId, 10) : null;
    const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 25;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["1=1"];
    const params: Record<string, unknown> = { offset, limit };

    if (search) {
      conditions.push("(LOWER(name) LIKE LOWER(@search))");
      params.search = `%${search}%`;
    }

    if (teamId && !isNaN(teamId)) {
      // internal_team_id
      conditions.push("(internal_team_id = @teamId OR team_external_id = (SELECT external_id FROM teams WHERE team_id = @teamId))");
      params.teamId = teamId;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const playersResult = await query<{
      player_id: number;
      full_name: string;
      display_name: string | null;
      date_of_birth: string;
      nationality: string;
      preferred_position: string | null;
      current_team_id: number | null;
    }>(
      `
        SELECT 
          id as player_id,
          name as full_name,
          name as display_name,
          CONVERT(VARCHAR(10), date_of_birth, 23) as date_of_birth,
          nationality,
          position as preferred_position,
          internal_team_id as current_team_id
        FROM FootballPlayers
        ${whereClause}
        ORDER BY name
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
      `,
      params,
    );

    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM FootballPlayers ${whereClause}`,
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

    const result = await query(
      `
        SELECT 
          id as player_id,
          name as full_name,
          name as display_name,
          CONVERT(VARCHAR(10), date_of_birth, 23) as date_of_birth,
          nationality,
          position as preferred_position,
          internal_team_id as current_team_id
        FROM FootballPlayers
        WHERE id = @playerId;
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
        UPDATE FootballPlayers
        SET 
          name = COALESCE(@name, name),
          position = COALESCE(@position, position),
          nationality = COALESCE(@nationality, nationality),
          updated_at = GETDATE()
        WHERE id = @playerId;
      `,
      {
        playerId,
        name: name || null,
        position: position || null,
        nationality: nationality || null,
      },
    );

    // Return updated player
    const result = await query(
      `
        SELECT id as player_id, name as full_name, position as preferred_position, nationality
        FROM FootballPlayers
        WHERE id = @playerId;
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
        DELETE FROM FootballPlayers
        WHERE id = @playerId;
      `,
      { playerId },
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
