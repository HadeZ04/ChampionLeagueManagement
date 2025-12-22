import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import {
  addLeaderboardEntry,
  deleteLeaderboardEntry,
  listLeaderboardEntries,
  updateLeaderboardEntry,
} from "../services/leaderboardService";

const router = Router();
const requireLeaderboardManagement = [requireAuth, requirePermission("manage_matches")] as const;

const parseSeason = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

router.get("/", async (req, res, next) => {
  try {
    const season = parseSeason(req.query.season);
    const data = await listLeaderboardEntries(season);
    res.json({
      data,
      meta: {
        season: season ?? undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", ...requireLeaderboardManagement, async (req, res, next) => {
  try {
    const entry = await addLeaderboardEntry(req.body);
    res.status(201).json({ data: entry });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", ...requireLeaderboardManagement, async (req, res, next) => {
  try {
    const updated = await updateLeaderboardEntry(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Leaderboard entry not found" });
    }
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", ...requireLeaderboardManagement, async (req, res, next) => {
  try {
    const removed = await deleteLeaderboardEntry(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: "Leaderboard entry not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
