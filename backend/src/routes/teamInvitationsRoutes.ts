import { Router, Response } from "express";
import { requireAuth, requireAnyPermission } from "../middleware/authMiddleware";
import * as invitationService from "../services/seasonInvitationService";
import { AuthenticatedRequest } from "../types";

const router = Router();

/**
 * Helper: check if user is BTC/admin (để cho phép override trong trường hợp đặc biệt)
 * Tùy dự án: bạn có thể check permissions/roles.
 */
function isAdminUser(req: AuthenticatedRequest): boolean {
    const u: any = req.user;
    const perms: string[] = u?.permissions ?? [];
    const roles: string[] = u?.roles ?? [];
    return (
        perms.includes("manage_teams") ||
        perms.includes("manage_rulesets") ||
        roles.includes("super_admin")
    );
}

/**
 * GET /api/teams/me/invitations
 * Team user xem các lời mời pending của đội mình (managed_team_id)
 */
router.get(
    "/teams/me/invitations",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const managedTeamId = (req.user as any)?.managed_team_id;

            if (!managedTeamId) {
                // Tùy UX: trả 200 rỗng hoặc 403. Anti nói có thể rỗng/403.
                return res.json({ data: [] });
            }

            const invitations = await invitationService.getPendingInvitationsForTeam(
                Number(managedTeamId)
            );

            // Transform giống format FE bạn đang dùng
            const transformed = invitations.map((inv) => ({
                invitationId: inv.invitation_id,
                seasonId: inv.season_id,
                teamId: inv.team_id,
                teamName: inv.team_name,
                shortName: null,
                inviteType: inv.invite_type,
                status: inv.status,
                invitedAt: inv.invited_at,
                responseDeadline: inv.response_deadline,
                respondedAt: inv.responded_at,
                responseNotes: inv.response_notes,
                replacementForId: inv.replacement_for_id,
            }));

            res.json({ data: transformed });
        } catch (e: any) {
            res.status(500).json({ error: e?.message || "Failed to fetch invitations" });
        }
    }
);

/**
 * PATCH /api/invitations/:invitationId/respond
 * Team user phản hồi lời mời (accepted/declined)
 * Payload: { status: 'accepted'|'declined', responseNotes?: string }
 */
router.patch(
    "/invitations/:invitationId/respond",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const invitationId = parseInt(req.params.invitationId, 10);
            if (isNaN(invitationId)) {
                return res.status(400).json({ error: "Invalid invitation ID" });
            }

            const { status, responseNotes } = req.body as {
                status: "accepted" | "declined";
                responseNotes?: string;
            };

            if (status !== "accepted" && status !== "declined" && (status as any) !== "rejected") {
                return res.status(400).json({ error: "status must be accepted|declined" });
            }

            const inv = await invitationService.getInvitationDetails(invitationId);
            if (!inv) return res.status(404).json({ error: "Invitation not found" });

            const managedTeamId = (req.user as any)?.managed_team_id;
            const admin = isAdminUser(req);

            // Ownership check
            if (!admin && (!managedTeamId || Number(managedTeamId) !== inv.team_id)) {
                return res.status(403).json({ error: "Forbidden" });
            }

            // Deadline check
            if (inv.response_deadline && new Date(inv.response_deadline).getTime() < Date.now()) {
                return res.status(400).json({ error: "Invitation expired" });
            }

            const userId = (req.user as any)?.sub; // bạn đang dùng sub ở các route khác
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            if (status === "accepted") {
                await invitationService.acceptInvitation(invitationId, Number(userId), responseNotes);
            } else {
                // declined (or rejected mapped to declined)
                // rejectInvitation will set db status 'declined'
                await invitationService.rejectInvitation(invitationId, Number(userId), responseNotes);
            }

            res.json({ data: { message: "Response submitted" } });
        } catch (e: any) {
            res.status(500).json({ error: e?.message || "Failed to respond invitation" });
        }
    }
);

export default router;
