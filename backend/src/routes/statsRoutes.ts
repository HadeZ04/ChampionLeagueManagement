import { Router } from "express";
import {
  addPlayerStat,
  deletePlayerStat,
  getPlayerStatDetail,
  listPlayerStats,
  updatePlayerStat,
} from "../services/playerStatsService";

const router = Router();

const parseCategory = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

const parseSeason = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

router.get("/players", async (req, res, next) => {
  try {
    const category = parseCategory(req.query.category);
    const season = parseSeason(req.query.season);
    const data = await listPlayerStats(season, category as any);
    res.json({ data, meta: { season: season ?? undefined } });
  } catch (error) {
    next(error);
  }
});

router.post("/players", async (req, res, next) => {
  try {
    const entry = await addPlayerStat(req.body);
    res.status(201).json({ data: entry });
  } catch (error) {
    next(error);
  }
});

router.put("/players/:id", async (req, res, next) => {
  try {
    const updated = await updatePlayerStat(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Player stat not found" });
    }
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete("/players/:id", async (req, res, next) => {
  try {
    const removed = await deletePlayerStat(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: "Player stat not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/players/:id", async (req, res, next) => {
  try {
    const detail = await getPlayerStatDetail(req.params.id);
    if (!detail) {
      return res.status(404).json({ message: "Player stat not found" });
    }
    res.json({ data: detail });
  } catch (error) {
    next(error);
  }
});

export default router;
