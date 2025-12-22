import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { uploadCsv } from "../middleware/uploadCsvMiddleware";

import {
    listSeasonPlayers,
    listSeasonTeams,
} from "../controllers/seasonPlayerQueryController";

import {
    approveAll,
    importCSV,
} from "../controllers/seasonPlayerRegistrationController";

const router = Router();

/**
 * GET /api/seasons/:seasonId/players
 * Admin / Staff: list all players registered in a season
 * Supports filters: team_id, position_code, player_type
 */
router.get("/seasons/:seasonId/players", requireAuth, listSeasonPlayers);

/**
 * GET /api/seasons/:seasonId/teams
 * Admin / Staff: list all teams participating in a season
 */
router.get("/seasons/:seasonId/teams", requireAuth, listSeasonTeams);

/**
 * POST /api/season-players/approve-all
 * Admin / Staff: approve all pending registrations
 */
router.post(
    "/season-players/approve-all",
    requireAuth,
    approveAll
);

/**
 * POST /api/season-players/import-csv
 * Club: import players by CSV (transactional)
 */
router.post(
    "/season-players/import-csv",
    requireAuth,
    uploadCsv,
    importCSV
);

export default router;

