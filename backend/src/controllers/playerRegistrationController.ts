import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { BadRequestError, ForbiddenError } from "../utils/httpError";
import { getUserTeamIds } from "../services/userTeamService";
import {
  createPlayerRegistration,
  listPlayerRegistrations,
  updatePlayerRegistration,
} from "../services/playerRegistrationService";
import { approveRegistration, rejectRegistration } from "../services/seasonPlayerRegistrationService";

function hasPermission(req: AuthenticatedRequest, permission: string) {
  const permissions = Array.isArray(req.user?.permissions) ? req.user?.permissions : [];
  return permissions.includes(permission);
}

function isGlobalRegistrationUser(req: AuthenticatedRequest) {
  return (
    Array.isArray(req.user?.roles) && req.user?.roles.includes("super_admin")
  ) ||
    hasPermission(req, "approve_player_registrations") ||
    hasPermission(req, "manage_teams");
}

async function resolveScopedTeamIds(req: AuthenticatedRequest) {
  if (isGlobalRegistrationUser(req)) {
    return null;
  }

  const teamIdsFromToken = Array.isArray(req.user?.teamIds) ? req.user?.teamIds : null;
  if (teamIdsFromToken) {
    return teamIdsFromToken;
  }

  const userId = req.user?.sub;
  if (!userId) {
    return [];
  }
  return getUserTeamIds(userId);
}

export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  const seasonIdRaw = String(req.query.seasonId ?? req.query.season_id ?? "").trim();
  const teamIdRaw = String(req.query.teamId ?? req.query.team_id ?? "").trim();
  const statusRaw = String(req.query.status ?? req.query.registration_status ?? "").trim();

  const seasonId = seasonIdRaw ? Number(seasonIdRaw) : undefined;
  const teamId = teamIdRaw ? Number(teamIdRaw) : undefined;

  if (seasonIdRaw && Number.isNaN(seasonId)) {
    throw BadRequestError("Invalid seasonId");
  }

  if (teamIdRaw && Number.isNaN(teamId)) {
    throw BadRequestError("Invalid teamId");
  }

  const scopedTeamIds = await resolveScopedTeamIds(req);
  if (Array.isArray(scopedTeamIds) && teamId && !scopedTeamIds.includes(teamId)) {
    throw ForbiddenError("You are not allowed to access this team");
  }

  const data = await listPlayerRegistrations(
    {
      seasonId,
      teamId,
      status: statusRaw || undefined,
    },
    scopedTeamIds
  );

  res.json(data);
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    throw BadRequestError("File is required (PDF format)");
  }

  const seasonId = Number(req.body.season_id ?? req.body.seasonId);
  const seasonTeamId = Number(req.body.season_team_id ?? req.body.seasonTeamId);

  if (Number.isNaN(seasonId) || seasonId <= 0) {
    throw BadRequestError("Invalid season_id");
  }

  if (Number.isNaN(seasonTeamId) || seasonTeamId <= 0) {
    throw BadRequestError("Invalid season_team_id");
  }

  const fullName = String(req.body.full_name ?? req.body.fullName ?? "").trim();
  const dateOfBirth = String(req.body.date_of_birth ?? req.body.dateOfBirth ?? "").trim();
  const nationality = req.body.nationality ?? null;
  const positionCode = String(req.body.position_code ?? req.body.positionCode ?? "").trim();
  const playerType = String(req.body.player_type ?? req.body.playerType ?? "").trim();

  const shirtNumberRaw = req.body.shirt_number ?? req.body.shirtNumber;
  const shirtNumber =
    shirtNumberRaw === "" || shirtNumberRaw === undefined || shirtNumberRaw === null
      ? null
      : Number(shirtNumberRaw);

  if (shirtNumber !== null && Number.isNaN(shirtNumber)) {
    throw BadRequestError("shirt_number must be a number");
  }

  const scopedTeamIds = await resolveScopedTeamIds(req);
  await createPlayerRegistration({
    seasonId,
    seasonTeamId,
    fullName,
    dateOfBirth,
    nationality,
    positionCode,
    shirtNumber,
    playerType,
    filePath: file.path,
    actorId: req.user?.sub,
    actorUsername: req.user?.username,
    scopedTeamIds,
  });

  res.status(201).json({ message: "Registration created successfully" });
}

export async function update(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw BadRequestError("Invalid registration id");
  }

  const file = req.file;
  const fullName = req.body.full_name ?? req.body.fullName;
  const dateOfBirth = req.body.date_of_birth ?? req.body.dateOfBirth;
  const nationality = req.body.nationality;
  const positionCode = req.body.position_code ?? req.body.positionCode;
  const playerType = req.body.player_type ?? req.body.playerType;

  const shirtNumberRaw = req.body.shirt_number ?? req.body.shirtNumber;
  const shirtNumber =
    shirtNumberRaw === undefined
      ? undefined
      : shirtNumberRaw === ""
      ? null
      : Number(shirtNumberRaw);

  if (shirtNumber !== undefined && shirtNumber !== null && Number.isNaN(shirtNumber)) {
    throw BadRequestError("shirt_number must be a number");
  }

  const scopedTeamIds = await resolveScopedTeamIds(req);
  await updatePlayerRegistration(id, {
    fullName: fullName !== undefined ? String(fullName) : undefined,
    dateOfBirth: dateOfBirth !== undefined ? String(dateOfBirth) : undefined,
    nationality: nationality !== undefined ? nationality : undefined,
    positionCode: positionCode !== undefined ? String(positionCode) : undefined,
    shirtNumber,
    playerType: playerType !== undefined ? String(playerType) : undefined,
    filePath: file ? file.path : undefined,
    actorId: req.user?.sub,
    scopedTeamIds,
  });

  res.json({ message: "Registration updated successfully" });
}

export async function approve(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw BadRequestError("Invalid registration id");
  }

  await approveRegistration(id, req.user?.sub);
  res.json({ message: "Approved successfully" });
}

export async function reject(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw BadRequestError("Invalid registration id");
  }

  const reason = String(req.body.reason ?? req.body.rejectReason ?? "").trim();
  if (!reason) {
    throw BadRequestError("Reject reason is required");
  }

  await rejectRegistration(id, reason, req.user?.sub);
  res.json({ message: "Rejected successfully" });
}
