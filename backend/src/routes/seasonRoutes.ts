import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import { listSeasons } from "../services/seasonService";

const router = Router();

router.get(
  "/",
  requireAuth,
  requirePermission("manage_rulesets"),
  async (_req, res) => {
    const seasons = await listSeasons();
    res.json(seasons);
  }
);

export default router;
