import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticateJWT);

router.get("/", getSettings);
router.put("/", requireAdmin, updateSettings);

export default router;
