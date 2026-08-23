import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { getOverdueThresholdDays, computeOverdue } from "../services/overdueService.js";

export async function getDashboardMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const thresholdDays = await getOverdueThresholdDays();

    // Fetch all complaints for calculation
    const allComplaints = await prisma.complaint.findMany({
      select: {
        id: true,
        status: true,
        category: true,
        priority: true,
        createdAt: true,
        resolvedAt: true,
      },
    });

    const totalComplaints = allComplaints.length;
    let openCount = 0;
    let inProgressCount = 0;
    let resolvedCount = 0;
    let overdueCount = 0;

    const categoryMap: Record<string, number> = {};
    const priorityMap: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    let totalResolutionDays = 0;
    let resolvedItemsCount = 0;

    for (const c of allComplaints) {
      // Status breakdown
      if (c.status === "OPEN") openCount++;
      else if (c.status === "IN_PROGRESS") inProgressCount++;
      else if (c.status === "RESOLVED") resolvedCount++;

      // Overdue calculation
      const { isOverdue } = computeOverdue(c, thresholdDays);
      if (isOverdue) overdueCount++;

      // Category breakdown
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;

      // Priority breakdown
      priorityMap[c.priority] = (priorityMap[c.priority] || 0) + 1;

      // Resolution time
      if (c.status === "RESOLVED" && c.resolvedAt) {
        const diff = new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        totalResolutionDays += Math.max(days, 0.1);
        resolvedItemsCount++;
      }
    }

    const byCategory = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      count: categoryMap[cat],
    }));

    const byStatus = [
      { status: "OPEN", label: "Open", count: openCount, color: "#f59e0b" },
      { status: "IN_PROGRESS", label: "In Progress", count: inProgressCount, color: "#3b82f6" },
      { status: "RESOLVED", label: "Resolved", count: resolvedCount, color: "#10b981" },
    ];

    const byPriority = [
      { priority: "HIGH", label: "High", count: priorityMap.HIGH || 0, color: "#ef4444" },
      { priority: "MEDIUM", label: "Medium", count: priorityMap.MEDIUM || 0, color: "#f97316" },
      { priority: "LOW", label: "Low", count: priorityMap.LOW || 0, color: "#10b981" },
    ];

    const avgResolutionDays = resolvedItemsCount > 0
      ? (totalResolutionDays / resolvedItemsCount).toFixed(1)
      : "N/A";

    const totalResidents = await prisma.user.count({
      where: { role: "RESIDENT" },
    });

    const totalNotices = await prisma.notice.count();

    // Recent activity audit trail (latest 8)
    const recentActivity = await prisma.complaintHistory.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { id: true, name: true, role: true } },
        complaint: { select: { id: true, title: true, flatNumber: true } },
      },
    });

    res.json({
      summary: {
        totalComplaints,
        openCount,
        inProgressCount,
        resolvedCount,
        overdueCount,
        totalResidents,
        totalNotices,
        avgResolutionDays,
        thresholdDays,
      },
      byStatus,
      byCategory,
      byPriority,
      recentActivity,
    });
  } catch (error: any) {
    console.error("Get dashboard metrics error:", error);
    res.status(500).json({ message: "Failed to fetch metrics", error: error.message });
  }
}
