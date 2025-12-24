import { Router } from "express";
import { z } from "zod";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import { query } from "../db/sqlServer";
import { logEvent } from "../services/auditService";
import {
  createMatch,
  deleteMatch,
  getMatchById,
  listLiveMatches,
  listMatches,
  generateRandomMatches,
  updateMatch,
  listFootballMatches,
} from "../services/matchService";
import { syncMatchesOnly } from "../services/syncService";

const router = Router();
const requireMatchManagement = [requireAuth, requirePermission("manage_matches")] as const;

const isValidDate = (value: string): boolean => !Number.isNaN(Date.parse(value));

const listQuerySchema = z.object({
  status: z.string().trim().optional(),
  seasonId: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().int().positive().optional())
    .optional(),
  search: z.string().trim().optional(),
  teamId: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().int().positive().optional())
    .optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  page: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().int().positive().optional())
    .optional(),
  limit: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().int().positive().optional())
    .optional(),
  showUnknown: z
    .string()
    .trim()
    .optional()
    .transform((value) => value === "true" || value === "1"),
});

const externalMatchesQuerySchema = z.object({
  status: z.string().trim().optional(),
  season: z.string().trim().optional(),
  search: z.string().trim().optional(),
  teamId: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().int().positive().optional())
    .optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  page: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().int().positive().optional())
    .optional(),
  limit: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().int().positive().optional())
    .optional(),
  showUnknown: z
    .string()
    .trim()
    .optional()
    .transform((value) => value === "true" || value === "1"),
});

const createSchema = z.object({
  homeTeamId: z.number().int().positive(),
  awayTeamId: z.number().int().positive(),
  scheduledKickoff: z
    .string()
    .trim()
    .refine((value) => isValidDate(value), { message: "scheduledKickoff must be a valid ISO date string" }),
  seasonId: z.number().int().positive().optional(),
  roundNumber: z.number().int().positive().optional(),
  matchdayNumber: z.number().int().positive().optional(),
  stadiumId: z.number().int().positive().optional(),
  status: z.string().trim().optional(),
});

const generateSchema = z.object({
  count: z.number().int().positive().optional(),
  seasonId: z.number().int().positive().optional(),
  startDate: z
    .string()
    .trim()
    .optional()
    .refine((value) => (value ? isValidDate(value) : true), { message: "startDate must be a valid ISO date" }),
});

const syncSchema = z.object({
  season: z.string().trim().optional(),
  status: z.string().trim().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
});

const updateSchema = z.object({
  status: z.string().trim().optional(),
  homeScore: z.number().int().nonnegative().nullable().optional(),
  awayScore: z.number().int().nonnegative().nullable().optional(),
  attendance: z.number().int().nonnegative().nullable().optional(),
  scheduledKickoff: z
    .string()
    .trim()
    .optional()
    .refine((value) => (value ? isValidDate(value) : true), { message: "scheduledKickoff must be a valid ISO date" }),
  stadiumId: z.number().int().positive().optional(),
  description: z.string().trim().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const filters = listQuerySchema.parse(req.query);
    const result = await listMatches(filters);
    res.json({
      data: result.data,
      total: result.total,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/live", async (_req, res, next) => {
  try {
    const matches = await listLiveMatches();
    res.json({ data: matches, total: matches.length });
  } catch (error) {
    next(error);
  }
});

router.get("/external", async (req, res, next) => {
  try {
    const filters = externalMatchesQuerySchema.parse(req.query);
    const result = await listFootballMatches(filters);
    res.json({
      data: result.data,
      total: result.total,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

const createEventSchema = z.object({
  teamId: z.number().int().positive(),
  type: z.string().trim().min(1).max(32),
  minute: z.number().int().min(0).max(130),
  description: z.string().trim().max(255).optional().nullable(),
  playerId: z.number().int().positive().optional().nullable(),
  playerName: z.string().trim().max(100).optional().nullable(),
});

router.get("/:id/events", async (req, res, next) => {
  try {
    const matchId = Number(req.params.id);
    if (!Number.isInteger(matchId) || matchId <= 0) {
      return res.status(400).json({ message: "Invalid match id" });
    }

    const eventsResult = await query(
      `SELECT
          me.match_event_id AS id,
          stp.team_id AS teamId,
          me.player_name AS player,
          me.event_type AS type,
          me.event_minute AS minute,
          me.description
        FROM match_events me
        INNER JOIN season_team_participants stp ON me.season_team_id = stp.season_team_id
        WHERE me.match_id = @matchId
        ORDER BY me.event_minute ASC, me.created_at ASC;`,
      { matchId },
    );

    res.json({ data: eventsResult.recordset });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/events", ...requireMatchManagement, async (req: any, res, next) => {
  try {
    const matchId = Number(req.params.id);
    if (!Number.isInteger(matchId) || matchId <= 0) {
      return res.status(400).json({ message: "Invalid match id" });
    }

    const payload = createEventSchema.parse(req.body ?? {});
    const eventType = payload.type.toUpperCase();

    const matchInfo = await query<{
      seasonId: number;
      homeTeamId: number;
      awayTeamId: number;
      homeSeasonTeamId: number;
      awaySeasonTeamId: number;
      status: string;
    }>(
      `SELECT
          m.season_id AS seasonId,
          hstp.team_id AS homeTeamId,
          astp.team_id AS awayTeamId,
          m.home_season_team_id AS homeSeasonTeamId,
          m.away_season_team_id AS awaySeasonTeamId,
          m.status
        FROM matches m
        INNER JOIN season_team_participants hstp ON m.home_season_team_id = hstp.season_team_id
        INNER JOIN season_team_participants astp ON m.away_season_team_id = astp.season_team_id
        WHERE m.match_id = @matchId;`,
      { matchId },
    );

    const match = matchInfo.recordset[0];
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    let seasonTeamId: number | null = null;
    let isHome = false;
    if (payload.teamId === match.homeTeamId) {
      seasonTeamId = match.homeSeasonTeamId;
      isHome = true;
    } else if (payload.teamId === match.awayTeamId) {
      seasonTeamId = match.awaySeasonTeamId;
      isHome = false;
    } else {
      return res.status(400).json({ message: "teamId does not belong to this match" });
    }

    let playerName: string | null = payload.playerName ? payload.playerName.trim() : null;
    if (!playerName && payload.playerId) {
      const player = await query<{ full_name: string }>(
        `SELECT TOP 1 full_name FROM players WHERE player_id = @playerId;`,
        { playerId: payload.playerId },
      );
      playerName = player.recordset[0]?.full_name ?? null;
    }

    const insertResult = await query<{ match_event_id: number }>(
      `INSERT INTO match_events (
          match_id,
          season_id,
          season_team_id,
          player_name,
          event_type,
          event_minute,
          description
        )
        OUTPUT INSERTED.match_event_id
        VALUES (
          @matchId,
          @seasonId,
          @seasonTeamId,
          @playerName,
          @eventType,
          @minute,
          @description
        );`,
      {
        matchId,
        seasonId: match.seasonId,
        seasonTeamId,
        playerName,
        eventType,
        minute: payload.minute,
        description: payload.description ?? null,
      },
    );

    const eventId = insertResult.recordset[0]?.match_event_id;

    // Update score for goal-type events.
    let homeInc = 0;
    let awayInc = 0;
    if (eventType === "GOAL") {
      homeInc = isHome ? 1 : 0;
      awayInc = isHome ? 0 : 1;
    } else if (eventType === "OWN_GOAL") {
      homeInc = isHome ? 0 : 1;
      awayInc = isHome ? 1 : 0;
    }

    if (homeInc || awayInc) {
      await query(
        `UPDATE matches
          SET home_score = COALESCE(home_score, 0) + @homeInc,
              away_score = COALESCE(away_score, 0) + @awayInc,
              updated_at = SYSUTCDATETIME()
          WHERE match_id = @matchId;`,
        { matchId, homeInc, awayInc },
      );
    }

    // Auto-transition scheduled -> in_progress once an event arrives.
    if (match.status === "scheduled") {
      await query(
        `UPDATE matches SET status = 'in_progress', updated_at = SYSUTCDATETIME() WHERE match_id = @matchId;`,
        { matchId },
      );
    }

    await logEvent({
      eventType: "MATCH_EVENT_CREATED",
      severity: "info",
      actorId: req.user?.sub,
      actorUsername: req.user?.username,
      actorRole: Array.isArray(req.user?.roles) ? req.user.roles[0] : undefined,
      entityType: "MATCH",
      entityId: String(matchId),
      payload: {
        id: eventId,
        teamId: payload.teamId,
        type: eventType,
        minute: payload.minute,
        player: playerName,
      },
    });

    res.status(201).json({
      data: {
        id: eventId,
        teamId: payload.teamId,
        player: playerName,
        type: eventType,
        minute: payload.minute,
        description: payload.description ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", ...requireMatchManagement, async (req, res, next) => {
  try {
    const payload = createSchema.parse(req.body ?? {});
    const match = await createMatch(payload);
    res.status(201).json({ data: match });
  } catch (error) {
    next(error);
  }
});

router.post("/generate/random", ...requireMatchManagement, async (req, res, next) => {
  try {
    const payload = generateSchema.parse(req.body ?? {});
    const result = await generateRandomMatches(payload);
    res.status(201).json({
      message: "Random matches generated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/sync", ...requireMatchManagement, async (req, res, next) => {
  try {
    const payload = syncSchema.parse(req.body ?? {});
    const result = await syncMatchesOnly(
      payload.season,
      payload.status,
      payload.dateFrom,
      payload.dateTo
    );

    if (result.success) {
      res.json({
        success: true,
        message: "Matches synced successfully",
        data: result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Matches sync failed",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid match id" });
    }
    const match = await getMatchById(id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.json({ data: match });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", ...requireMatchManagement, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid match id" });
    }
    const payload = updateSchema.parse(req.body ?? {});
    const updated = await updateMatch(id, payload);
    if (!updated) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/results", ...requireMatchManagement, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid match id" });
    }
    const payload = updateSchema.parse(req.body ?? {});
    const updated = await updateMatch(id, payload);
    if (!updated) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

// Bulk delete all matches (optionally filtered by seasonId)
// NOTE: This route MUST be placed BEFORE /:id to avoid matching "bulk" as an ID
router.delete("/bulk", ...requireMatchManagement, async (req, res, next) => {
  try {
    const seasonId = req.query.seasonId ? Number(req.query.seasonId) : undefined;
    
    let whereClause = "";
    const params: Record<string, unknown> = {};
    
    if (seasonId && Number.isInteger(seasonId) && seasonId > 0) {
      whereClause = "WHERE season_id = @seasonId";
      params.seasonId = seasonId;
    }
    
    const result = await query(
      `DELETE FROM matches ${whereClause};`,
      params
    );
    
    const deletedCount = result.rowsAffected?.[0] ?? 0;
    
    res.json({ 
      message: `Successfully deleted ${deletedCount} matches`,
      count: deletedCount 
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", ...requireMatchManagement, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid match id" });
    }
    const deleted = await deleteMatch(id);
    if (!deleted) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
