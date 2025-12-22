import { Request, Response } from "express";
import {
    getSeasonPlayers,
    getSeasonTeams,
    SeasonPlayerQueryFilters
} from "../services/seasonPlayerQueryService";
import { BadRequestError } from "../utils/httpError";

export async function listSeasonPlayers(req: Request, res: Response): Promise<void> {
    const { seasonId } = req.params;

    if (!seasonId || isNaN(Number(seasonId))) {
        throw BadRequestError("INVALID_SEASON_ID");
    }

    const numericSeasonId = Number(seasonId);

    // team_id (optional)
    const teamIdRaw = req.query.team_id as string | undefined;
    const teamId = teamIdRaw !== undefined ? Number(teamIdRaw) : undefined;
    if (teamId !== undefined && isNaN(teamId)) {
        throw BadRequestError("INVALID_TEAM_ID");
    }

    // position_code (optional)
    const positionCode = req.query.position_code as string | undefined;

    // nationality_type (optional) - chỉ nhận 'foreign' | 'domestic'
    const nationalityTypeRaw = req.query.nationality_type as string | undefined;

    let nationality_type: "foreign" | "domestic" | undefined = undefined;
    if (nationalityTypeRaw !== undefined && nationalityTypeRaw !== null && nationalityTypeRaw !== "") {
        const normalized = String(nationalityTypeRaw).toLowerCase();
        if (normalized !== "foreign" && normalized !== "domestic") {
            throw BadRequestError("INVALID_NATIONALITY_TYPE");
        }
        nationality_type = normalized as "foreign" | "domestic";
    }

    const filters: SeasonPlayerQueryFilters = {
        team_id: teamId,
        position_code: positionCode,
        nationality_type
    };

    const players = await getSeasonPlayers(numericSeasonId, filters);

    res.json({
        season_id: numericSeasonId,
        total: players.length,
        players
    });
}

export async function listSeasonTeams(req: Request, res: Response): Promise<void> {
    const { seasonId } = req.params;

    if (!seasonId || isNaN(Number(seasonId))) {
        throw BadRequestError("INVALID_SEASON_ID");
    }

    const teams = await getSeasonTeams(Number(seasonId));

    res.json({
        season_id: Number(seasonId),
        count: teams.length,
        teams
    });
}
