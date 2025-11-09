import { Router } from "express";
import { z } from "zod";
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

router.post("/", async (req, res, next) => {
  try {
    const payload = createSchema.parse(req.body ?? {});
    const match = await createMatch(payload);
    res.status(201).json({ data: match });
  } catch (error) {
    next(error);
  }
});

router.post("/generate/random", async (req, res, next) => {
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

router.post("/sync", async (req, res, next) => {
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

router.put("/:id", async (req, res, next) => {
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

router.post("/:id/results", async (req, res, next) => {
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

router.delete("/:id", async (req, res, next) => {
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
