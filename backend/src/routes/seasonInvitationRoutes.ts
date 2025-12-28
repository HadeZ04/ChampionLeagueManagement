import { Router } from "express";
import { requireAuth, requireAnyPermission } from "../middleware/authMiddleware";
import * as invitationController from "../controllers/seasonInvitationController";

const router = Router();
const requireTeamManagement = requireAnyPermission("manage_teams", "manage_rulesets");

// --- BTC / Super Admin Routes ---

// List invitations
router.get(
  "/:seasonId/invitations",
  requireAuth,
  requireTeamManagement,
  invitationController.list
);

// Get stats
router.get(
  "/:seasonId/invitations/stats",
  requireAuth,
  requireTeamManagement,
  invitationController.getStats
);

// Auto-create (Plan A)
router.post(
  "/:seasonId/invitations/auto-create",
  requireAuth,
  requireTeamManagement,
  invitationController.autoCreate
);

// Auto-fill (Replacement)
router.post(
  "/:seasonId/invitations/auto-fill",
  requireAuth,
  requireTeamManagement,
  invitationController.autoFill
);

// Mark expired globally
router.post(
  "/invitations/mark-expired",
  requireAuth,
  requireTeamManagement,
  invitationController.markExpired
);

// Override status (khẩn cấp)
// Update status (Admin override / Rescind)
router.patch(
  "/:seasonId/invitations/:invitationId/status",
  requireAuth,
  requireTeamManagement,
  invitationController.updateStatus
);

// Re-invite (create new invitation for declined team)
router.post(
  "/:seasonId/invitations/:invitationId/reinvite",
  requireAuth,
  requireTeamManagement,
  invitationController.reinvite
);

// --- Legacy / Unused Routes (Returning 501) ---

router.post(
  "/:seasonId/invitations",
  requireAuth,
  requireTeamManagement,
  invitationController.create
);

router.get(
  "/:seasonId/invitations/:invitationId/eligibility",
  requireAuth,
  requireTeamManagement,
  invitationController.checkEligibility
);

router.post(
  "/:seasonId/invitations/:invitationId/create-replacement",
  requireAuth,
  requireTeamManagement,
  invitationController.createReplacement
);

router.post(
  "/:seasonId/invitations/ensure-minimum-teams",
  requireAuth,
  requireTeamManagement,
  invitationController.ensureMinimumTeams
);

export default router;
