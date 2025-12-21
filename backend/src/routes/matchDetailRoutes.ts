import { Router } from "express";
import { z } from "zod";
import * as eventService from "../services/matchEventService";
import * as lineupService from "../services/matchLineupService";
import * as statsService from "../services/playerMatchStatsService";

const router = Router();

// --- EVENTS ---

const createEventSchema = z.object({
    matchId: z.number().int().positive(),
    seasonId: z.number().int().positive(),
    seasonTeamId: z.number().int().positive(),
    type: z.enum(['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'OWN_GOAL', 'PENALTY_MISS', 'OTHER']),
    minute: z.number().int().min(0).max(130),
    description: z.string().optional(),
    playerId: z.number().int().positive().optional(),
    assistPlayerId: z.number().int().positive().optional(),
    inPlayerId: z.number().int().positive().optional(),
    outPlayerId: z.number().int().positive().optional(),
});

router.get("/:matchId/events", async (req, res, next) => {
    try {
        const matchId = Number(req.params.matchId);
        const events = await eventService.getMatchEvents(matchId);
        res.json({ data: events });
    } catch (error) { next(error); }
});

router.post("/:matchId/events", async (req, res, next) => {
    try {
        const matchId = Number(req.params.matchId);
        const payload = createEventSchema.parse({ ...req.body, matchId });
        const event = await eventService.createMatchEvent(payload);
        res.status(201).json({ data: event });
    } catch (error) { next(error); }
});

router.delete("/events/:eventId", async (req, res, next) => {
    try {
        const eventId = Number(req.params.eventId);
        await eventService.deleteMatchEvent(eventId);
        res.status(204).send();
    } catch (error) { next(error); }
});

// --- LINEUPS ---

router.get("/:matchId/lineups", async (req, res, next) => {
    try {
        const matchId = Number(req.params.matchId);
        const lineups = await lineupService.getMatchLineups(matchId);
        res.json({ data: lineups });
    } catch (error) { next(error); }
});

router.post("/:matchId/lineups", async (req, res, next) => {
    try {
        const matchId = Number(req.params.matchId);
        // Expecting array of players
        const payload = z.array(z.object({
            seasonTeamId: z.number(),
            playerId: z.number(),
            isStarting: z.boolean(),
            isCaptain: z.boolean(),
            jerseyNumber: z.number().optional(),
            position: z.string().optional(),
            status: z.string().default('active'),
            seasonId: z.number()
        })).parse(req.body);

        // Bulk upsert logic (loop for now)
        for (const item of payload) {
            await lineupService.upsertMatchLineup({ ...item, matchId });
        }

        res.json({ message: "Lineups updated" });
    } catch (error) { next(error); }
});

// --- STATS ---

router.get("/:matchId/stats", async (req, res, next) => {
    try {
        const matchId = Number(req.params.matchId);
        const stats = await statsService.getPlayerMatchStats(matchId);
        res.json({ data: stats });
    } catch (error) { next(error); }
});

router.put("/:matchId/stats/:playerId", async (req, res, next) => {
    try {
        const matchId = Number(req.params.matchId);
        const playerId = Number(req.params.playerId);
        const payload = req.body; // Weak validation here for dynamic stats, ideally stricter
        await statsService.updatePlayerStats(matchId, playerId, payload);
        res.json({ message: "Stats updated" });
    } catch (error) { next(error); }
});

export default router;
