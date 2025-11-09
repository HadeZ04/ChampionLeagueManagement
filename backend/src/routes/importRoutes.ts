import { Router } from "express";
import { importCLDataToInternal, clearImportedData } from "../services/importToInternalService";

const router = Router();

/**
 * POST /import/champions-league
 * Import Champions League data from Football* tables to internal database
 */
router.post("/champions-league", async (req, res, next) => {
  try {
    const {
      seasonName = "Champions League 2024/2025",
      tournamentCode = "UCL_2024",
      createTournament = true,
    } = req.body;

    const result = await importCLDataToInternal({
      seasonName,
      tournamentCode,
      createTournament,
    });

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.imported,
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        errors: result.errors,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /import/clear
 * Clear imported data (for testing)
 */
router.delete("/clear", async (req, res, next) => {
  try {
    const result = await clearImportedData();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

