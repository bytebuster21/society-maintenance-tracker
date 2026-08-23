import { Router } from "express";
import { getNotices, createNotice, deleteNotice } from "../controllers/noticeController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticateJWT);

router.get("/", getNotices);
router.post("/", requireAdmin, createNotice);
router.delete("/:id", requireAdmin, deleteNotice);

export default router;
