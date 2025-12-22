import { Request, Response } from "express";
import {
    registerPlayerForSeason,
    getPendingRegistrations,
    approveRegistration,
    rejectRegistration,
    approveAllPendingRegistrations,
    importSeasonPlayersFromCSV
} from "../services/seasonPlayerRegistrationService";
import { BadRequestError } from "../utils/httpError";
import { AuthenticatedRequest } from "../types";

/**
 * Register player for a season
 */
export async function register(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    // =========================
    // 0. Validate file
    // =========================
    const file = req.file;
    if (!file) {
        throw BadRequestError("File is required (PDF format)");
    }

    // =========================
    // 1. Extract body
    // =========================
    const {
        player_id,
        season_id,
        season_team_id,
        position_code,
        shirt_number,
        player_type
    } = req.body;

    // =========================
    // 2. Validate required fields
    // =========================
    if (
        !player_id ||
        !season_id ||
        !season_team_id ||
        !position_code ||
        !player_type
    ) {
        throw BadRequestError(
            "Missing required fields: player_id, season_id, season_team_id, position_code, player_type"
        );
    }

    // =========================
    // 3. Convert & validate numeric fields
    // =========================
    const numericPlayerId = Number(player_id);
    const numericSeasonId = Number(season_id);
    const numericSeasonTeamId = Number(season_team_id);

    if (
        isNaN(numericPlayerId) ||
        isNaN(numericSeasonId) ||
        isNaN(numericSeasonTeamId)
    ) {
        throw BadRequestError(
            "player_id, season_id, season_team_id must be numbers"
        );
    }

    let numericShirtNumber: number | undefined = undefined;
    if (shirt_number !== undefined && shirt_number !== null && shirt_number !== "") {
        numericShirtNumber = Number(shirt_number);
        if (isNaN(numericShirtNumber)) {
            throw BadRequestError("shirt_number must be a number");
        }
    }

    // =========================
    // 4. Validate player_type
    // =========================
    const normalizedPlayerType =
        typeof player_type === "string"
            ? player_type.toLowerCase()
            : "";

    if (normalizedPlayerType !== "foreign" && normalizedPlayerType !== "domestic") {
        throw BadRequestError("player_type must be 'foreign' or 'domestic'");
    }

    // =========================
    // 5. Get user from auth
    // =========================
    const userId = req.user?.sub;
    const username = req.user?.username;

    // =========================
    // 6. Call service
    // =========================
    await registerPlayerForSeason({
        season_id: numericSeasonId,
        player_id: numericPlayerId,
        season_team_id: numericSeasonTeamId,
        position_code,
        shirt_number: numericShirtNumber,
        player_type: normalizedPlayerType,
        file_path: file.path,
        user_id: userId,
        username
    });

    // =========================
    // 7. Response
    // =========================
    res.status(201).json({
        message: "Player registered successfully"
    });
}

/**
 * Get all pending season player registrations
 */
export async function listPending(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    const data = await getPendingRegistrations();
    res.json(data);
}

/**
 * Approve a season player registration
 */
export async function approve(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    const numericId = Number(req.params.id);

    if (isNaN(numericId)) {
        throw BadRequestError("Invalid registration id");
    }

    const userId = req.user?.sub;

    await approveRegistration(numericId, userId);

    res.json({ message: "Approved successfully" });
}

/**
 * Reject a season player registration
 */
export async function reject(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    const numericId = Number(req.params.id);
    const { reason } = req.body;

    if (isNaN(numericId)) {
        throw BadRequestError("Invalid registration id");
    }

    if (!reason) {
        throw BadRequestError("Reject reason is required");
    }

    const userId = req.user?.sub;

    await rejectRegistration(numericId, reason, userId);

    res.json({ message: "Rejected successfully" });
}

/**
 * Approve all pending registrations
 */
export async function approveAll(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    const userId = req.user?.sub;

    await approveAllPendingRegistrations(userId);

    res.json({
        message: "Approved all pending registrations",
    });
}

/**
 * Import season players from CSV
 */
export async function importCSV(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    const file = req.file;
    if (!file) {
        throw BadRequestError("File is required (CSV format)");
    }

    const { season_id, season_team_id } = req.body;
    if (!season_id || !season_team_id) {
        throw BadRequestError("season_id and season_team_id are required");
    }

    const numericSeasonId = Number(season_id);
    const numericSeasonTeamId = Number(season_team_id);

    if (isNaN(numericSeasonId) || isNaN(numericSeasonTeamId)) {
        throw BadRequestError("season_id and season_team_id must be numbers");
    }

    const userId = req.user?.sub;
    const username = req.user?.username;

    const result = await importSeasonPlayersFromCSV({
        season_id: numericSeasonId,
        season_team_id: numericSeasonTeamId,
        file_buffer: file.buffer,
        file_path: file.path,
        user_id: userId,
        username
    });

    res.json(result);
}
