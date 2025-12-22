import { Router } from "express";
import { upload } from "../middleware/uploadMiddleware";
import * as registrationController from "../controllers/seasonPlayerRegistrationController";
// Import auth middleware if needed, e.g., checkAuth or verifyToken from internal middleware
// import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Route: POST /api/season-players/register
// Add authentication middleware if this route should be protected (likely yes)
// router.post("/register", authenticate, upload.single("file"), registrationController.register);

// For now, based on user request "Create route", I will add it.
// Assuming we might want basic auth? Use request: "logAuditEvent(user_id...)", so auth is implied.
// Checking app.ts or auth library used.
// Based on "middleware/authMiddleware.ts" existing:
import { requireAuth } from "../middleware/authMiddleware";

router.get("/pending", requireAuth, registrationController.listPending);
router.post("/:id/approve", requireAuth, registrationController.approve);
router.post("/:id/reject", requireAuth, registrationController.reject);

router.post("/register", requireAuth, upload.single("file"), registrationController.register);

export default router;
