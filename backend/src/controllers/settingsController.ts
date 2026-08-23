import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { getOverdueThresholdDays, setOverdueThresholdDays } from "../services/overdueService.js";

export async function getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const overdueThresholdDays = await getOverdueThresholdDays();
    res.json({
      settings: {
        overdueThresholdDays,
      },
    });
  } catch (error: any) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Failed to fetch settings", error: error.message });
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { overdueThresholdDays } = req.body;

    const days = parseInt(overdueThresholdDays, 10);
    if (isNaN(days) || days < 1) {
      res.status(400).json({ message: "Overdue threshold days must be a positive number" });
      return;
    }

    const updated = await setOverdueThresholdDays(days);

    res.json({
      message: "Settings updated successfully",
      settings: {
        overdueThresholdDays: updated,
      },
    });
  } catch (error: any) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Failed to update settings", error: error.message });
  }
}
