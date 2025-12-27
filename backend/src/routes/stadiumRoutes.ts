import { Router, Request, Response } from "express";
import { requireAuth, requirePermission } from "../middleware/authMiddleware";
import * as stadiumService from "../services/stadiumService";

const router = Router();

/**
 * GET /api/stadiums
 * Get all stadiums
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const stadiums = await stadiumService.getAllStadiums();
    res.json(stadiums);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stadiums" });
  }
});

/**
 * GET /api/stadiums/active
 * Get only active stadiums
 */
router.get("/active", async (req: Request, res: Response) => {
  try {
    const stadiums = await stadiumService.getActiveStadiums();
    res.json(stadiums);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active stadiums" });
  }
});

/**
 * GET /api/stadiums/available/:matchDate
 * Get available stadiums for a specific date
 */
router.get("/available/:matchDate", async (req: Request, res: Response) => {
  try {
    const { matchDate } = req.params;
    const stadiums = await stadiumService.getAvailableStadiums(matchDate);
    res.json(stadiums);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch available stadiums" });
  }
});

/**
 * GET /api/stadiums/city/:city
 * Get stadiums by city
 */
router.get("/city/:city", async (req: Request, res: Response) => {
  try {
    const { city } = req.params;
    const stadiums = await stadiumService.getStadiumsByCity(city);
    res.json(stadiums);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stadiums by city" });
  }
});

/**
 * GET /api/stadiums/country/:country
 * Get stadiums by country
 */
router.get("/country/:country", async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    const stadiums = await stadiumService.getStadiumsByCountry(country);
    res.json(stadiums);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stadiums by country" });
  }
});

/**
 * GET /api/stadiums/team/:teamId
 * Get stadium associated with a team
 */
router.get("/team/:teamId", async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    const stadium = await stadiumService.getStadiumByTeam(teamId);

    if (!stadium) {
      return res.status(404).json({ error: "Stadium not found for team" });
    }

    res.json(stadium);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team stadium" });
  }
});

/**
 * GET /api/stadiums/:stadiumId
 * Get stadium by ID
 */
router.get("/:stadiumId", async (req: Request, res: Response) => {
  try {
    const stadiumId = parseInt(req.params.stadiumId, 10);
    const stadium = await stadiumService.getStadiumById(stadiumId);

    if (!stadium) {
      return res.status(404).json({ error: "Stadium not found" });
    }

    res.json(stadium);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stadium" });
  }
});

/**
 * POST /api/stadiums
 * Create a new stadium (Admin only)
 */
router.post(
  "/",
  requireAuth,
  requirePermission("manage_stadiums"),
  async (req: Request, res: Response) => {
    try {
      const {
        name,
        location,
        city,
        capacity,
        country,
        surface_type,
        year_built,
        team_id,
        managed_by_user_id,
        is_active,
      } = req.body;

      if (!name || !location || !city || !capacity || !country) {
        return res.status(400).json({
          error: "Missing required fields: name, location, city, capacity, country",
        });
      }

      const stadium = await stadiumService.createStadium({
        name,
        location,
        city,
        capacity: parseInt(capacity, 10),
        country,
        surface_type: surface_type || "grass",
        year_built: year_built ? parseInt(year_built, 10) : null,
        team_id: team_id ? parseInt(team_id, 10) : null,
        managed_by_user_id: managed_by_user_id
          ? parseInt(managed_by_user_id, 10)
          : req.user?.sub || null,
        is_active: is_active !== false,
      });

      res.status(201).json(stadium);
    } catch (error) {
      res.status(500).json({ error: "Failed to create stadium" });
    }
  }
);

/**
 * PUT /api/stadiums/:stadiumId
 * Update stadium information (Admin only)
 */
router.put(
  "/:stadiumId",
  requireAuth,
  requirePermission("manage_stadiums"),
  async (req: Request, res: Response) => {
    try {
      const stadiumId = parseInt(req.params.stadiumId, 10);
      const updates = {
        ...req.body,
        capacity: req.body.capacity ? parseInt(req.body.capacity, 10) : undefined,
        year_built: req.body.year_built
          ? parseInt(req.body.year_built, 10)
          : undefined,
        team_id: req.body.team_id ? parseInt(req.body.team_id, 10) : undefined,
        managed_by_user_id: req.body.managed_by_user_id
          ? parseInt(req.body.managed_by_user_id, 10)
          : undefined,
      };

      const stadium = await stadiumService.updateStadium(stadiumId, updates);

      if (!stadium) {
        return res.status(404).json({ error: "Stadium not found" });
      }

      res.json(stadium);
    } catch (error) {
      res.status(500).json({ error: "Failed to update stadium" });
    }
  }
);

/**
 * DELETE /api/stadiums/:stadiumId
 * Delete stadium (soft delete - sets is_active to false)
 */
router.delete(
  "/:stadiumId",
  requireAuth,
  requirePermission("manage_stadiums"),
  async (req: Request, res: Response) => {
    try {
      const stadiumId = parseInt(req.params.stadiumId, 10);
      await stadiumService.deleteStadium(stadiumId);
      res.json({ message: "Stadium deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete stadium" });
    }
  }
);

export default router;
