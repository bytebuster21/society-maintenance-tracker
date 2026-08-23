import { Router } from "express";
import { getDashboardMetrics } from "../controllers/dashboardController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/metrics", authenticateJWT, requireAdmin, getDashboardMetrics);

export default router;
