import { Router } from "express";
import { requireAuth, requireAnyPermission } from "../middleware/authMiddleware";
import * as invitationController from "../controllers/seasonInvitationController";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Require season/team management permissions
const requireSeasonManagement = requireAnyPermission("manage_rulesets", "manage_teams");

// GET /api/seasons/:seasonId/invitations - List all invitations for a season
router.get("/:seasonId/invitations", requireSeasonManagement, invitationController.list);

// POST /api/seasons/:seasonId/invitations - Create a single invitation
router.post("/:seasonId/invitations", requireSeasonManagement, invitationController.create);

// POST /api/seasons/:seasonId/invitations/auto-create - Auto-create invitations from previous season
router.post(
  "/:seasonId/invitations/auto-create",
  requireSeasonManagement,
  invitationController.autoCreate
);

// GET /api/seasons/:seasonId/invitations/:invitationId/eligibility - Check team eligibility
router.get(
  "/:seasonId/invitations/:invitationId/eligibility",
  requireSeasonManagement,
  invitationController.checkEligibility
);

// PATCH /api/seasons/:seasonId/invitations/:invitationId/status - Update invitation status
router.patch(
  "/:seasonId/invitations/:invitationId/status",
  requireSeasonManagement,
  invitationController.updateStatus
);

// GET /api/seasons/:seasonId/invitations/stats - Get invitation statistics
router.get(
  "/:seasonId/invitations/stats",
  requireSeasonManagement,
  invitationController.getStats
);

// POST /api/seasons/:seasonId/invitations/:invitationId/create-replacement - Create replacement invitation
router.post(
  "/:seasonId/invitations/:invitationId/create-replacement",
  requireSeasonManagement,
  invitationController.createReplacement
);

// POST /api/seasons/:seasonId/invitations/ensure-minimum-teams - Ensure minimum accepted teams
router.post(
  "/:seasonId/invitations/ensure-minimum-teams",
  requireSeasonManagement,
  invitationController.ensureMinimumTeams
);

export default router;

