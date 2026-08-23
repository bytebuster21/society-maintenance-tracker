import { Router } from "express";
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintPriority,
} from "../controllers/complaintController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

// Protect all complaint routes
router.use(authenticateJWT);

// Resident routes
router.post("/", upload.single("photo"), createComplaint);
router.get("/my", getMyComplaints);

// Admin routes
router.get("/", requireAdmin, getAllComplaints);
router.patch("/:id/status", requireAdmin, updateComplaintStatus);
router.patch("/:id/priority", requireAdmin, updateComplaintPriority);

// Shared by ID route (Admin or owning Resident)
router.get("/:id", getComplaintById);

export default router;
