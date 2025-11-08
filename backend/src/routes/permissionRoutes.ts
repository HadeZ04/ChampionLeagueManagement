import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import { listPermissions } from "../services/permissionService";

const router = Router();

router.get(
  "/",
  requireAuth,
  requirePermission("manage_users"),
  async (_req, res) => {
    const permissions = await listPermissions();
    res.json(permissions);
  }
);

export default router;
