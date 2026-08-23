import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { getOverdueThresholdDays, enrichComplaintWithOverdue } from "../services/overdueService.js";
import { sendComplaintStatusEmail } from "../services/emailService.js";

// Resident: Create Complaint
export async function createComplaint(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, description, category, flatNumber, priority = "MEDIUM" } = req.body;
    const residentId = req.user!.id;

    if (!title || !description || !category) {
      res.status(400).json({ message: "Title, description, and category are required" });
      return;
    }

    const assignedFlat = flatNumber || req.user?.flatNumber || "Unspecified";
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = await prisma.complaint.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        flatNumber: assignedFlat.trim(),
        photoUrl,
        priority: ["LOW", "MEDIUM", "HIGH"].includes(priority) ? priority : "MEDIUM",
        status: "OPEN",
        residentId,
        history: {
          create: {
            actorId: residentId,
            action: "CREATED",
            toStatus: "OPEN",
            toPriority: priority,
            note: "Complaint submitted by resident",
          },
        },
      },
      include: {
        resident: {
          select: { id: true, name: true, email: true, flatNumber: true, phone: true },
        },
        history: {
          include: {
            actor: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const threshold = await getOverdueThresholdDays();
    const enriched = enrichComplaintWithOverdue(complaint, threshold);

    res.status(201).json({
      message: "Complaint raised successfully",
      complaint: enriched,
    });
  } catch (error: any) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: "Failed to create complaint", error: error.message });
  }
}

// Resident: Get their complaints
export async function getMyComplaints(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const residentId = req.user!.id;
    const { status, category } = req.query;

    const whereClause: any = { residentId };
    if (status && typeof status === "string") {
      whereClause.status = status;
    }
    if (category && typeof category === "string") {
      whereClause.category = category;
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        resident: {
          select: { id: true, name: true, email: true, flatNumber: true },
        },
        history: {
          include: {
            actor: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const threshold = await getOverdueThresholdDays();
    const enriched = complaints.map((c) => enrichComplaintWithOverdue(c, threshold));

    res.json({
      complaints: enriched,
      count: enriched.length,
      thresholdDays: threshold,
    });
  } catch (error: any) {
    console.error("Get my complaints error:", error);
    res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
}

// Admin & Resident: Get complaint by ID
export async function getComplaintById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        resident: {
          select: { id: true, name: true, email: true, flatNumber: true, phone: true },
        },
        history: {
          include: {
            actor: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Role check: Residents can only see their own complaints
    if (req.user!.role !== "ADMIN" && complaint.residentId !== req.user!.id) {
      res.status(403).json({ message: "Access forbidden" });
      return;
    }

    const threshold = await getOverdueThresholdDays();
    const enriched = enrichComplaintWithOverdue(complaint, threshold);

    res.json({ complaint: enriched });
  } catch (error: any) {
    console.error("Get complaint by id error:", error);
    res.status(500).json({ message: "Failed to fetch complaint details", error: error.message });
  }
}

// Admin: Get all complaints with filters, search, and overdue priority surfacing
export async function getAllComplaints(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      status,
      category,
      priority,
      isOverdue,
      search,
      startDate,
      endDate,
    } = req.query;

    const threshold = await getOverdueThresholdDays();

    const whereClause: any = {};

    if (status && typeof status === "string" && status !== "ALL") {
      whereClause.status = status;
    }

    if (category && typeof category === "string" && category !== "ALL") {
      whereClause.category = category;
    }

    if (priority && typeof priority === "string" && priority !== "ALL") {
      whereClause.priority = priority;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate && typeof startDate === "string") {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.trim();
      whereClause.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { flatNumber: { contains: q } },
        { resident: { name: { contains: q } } },
        { resident: { email: { contains: q } } },
      ];
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        resident: {
          select: { id: true, name: true, email: true, flatNumber: true, phone: true },
        },
        history: {
          include: {
            actor: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let enriched = complaints.map((c) => enrichComplaintWithOverdue(c, threshold));

    // Filter by isOverdue if requested
    if (isOverdue === "true") {
      enriched = enriched.filter((c) => c.isOverdue);
    } else if (isOverdue === "false") {
      enriched = enriched.filter((c) => !c.isOverdue);
    }

    // Sort order: Overdue complaints surface at the top, then by priority (HIGH, MEDIUM, LOW), then createdAt desc
    const priorityWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

    enriched.sort((a, b) => {
      // 1. Overdue first
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;

      // 2. Open / In Progress before Resolved
      if (a.status !== "RESOLVED" && b.status === "RESOLVED") return -1;
      if (a.status === "RESOLVED" && b.status !== "RESOLVED") return 1;

      // 3. Priority weight
      const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (pDiff !== 0) return pDiff;

      // 4. Date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json({
      complaints: enriched,
      totalCount: enriched.length,
      overdueCount: enriched.filter((c) => c.isOverdue).length,
      thresholdDays: threshold,
    });
  } catch (error: any) {
    console.error("Get all complaints error:", error);
    res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
}

// Admin: Update complaint status
export async function updateComplaintStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status, note } = req.body;
    const adminId = req.user!.id;

    if (!["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
      res.status(400).json({ message: "Invalid status. Allowed: OPEN, IN_PROGRESS, RESOLVED" });
      return;
    }

    const existing = await prisma.complaint.findUnique({
      where: { id },
      include: {
        resident: { select: { id: true, name: true, email: true } },
      },
    });

    if (!existing) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    const fromStatus = existing.status;
    const resolvedAt = status === "RESOLVED" ? new Date() : (status !== "RESOLVED" && fromStatus === "RESOLVED" ? null : existing.resolvedAt);

    // Update Complaint and record history atomically
    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        status,
        resolvedAt,
        history: {
          create: {
            actorId: adminId,
            action: "STATUS_CHANGE",
            fromStatus,
            toStatus: status,
            note: note ? note.trim() : `Status updated to ${status}`,
          },
        },
      },
      include: {
        resident: {
          select: { id: true, name: true, email: true, flatNumber: true, phone: true },
        },
        history: {
          include: {
            actor: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const threshold = await getOverdueThresholdDays();
    const enriched = enrichComplaintWithOverdue(updatedComplaint, threshold);

    // Trigger email notification to resident asynchronously
    sendComplaintStatusEmail({
      residentEmail: existing.resident.email,
      residentName: existing.resident.name,
      complaintTitle: existing.title,
      complaintId: existing.id,
      fromStatus,
      toStatus: status,
      priority: existing.priority,
      note: note || undefined,
    }).catch((e) => console.error("Error triggering status email:", e));

    res.json({
      message: `Complaint status updated to ${status}`,
      complaint: enriched,
    });
  } catch (error: any) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Failed to update complaint status", error: error.message });
  }
}

// Admin: Update complaint priority
export async function updateComplaintPriority(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { priority, note } = req.body;
    const adminId = req.user!.id;

    if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
      res.status(400).json({ message: "Invalid priority. Allowed: LOW, MEDIUM, HIGH" });
      return;
    }

    const existing = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    const fromPriority = existing.priority;

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        priority,
        history: {
          create: {
            actorId: adminId,
            action: "PRIORITY_CHANGE",
            fromPriority,
            toPriority: priority,
            note: note ? note.trim() : `Priority updated to ${priority}`,
          },
        },
      },
      include: {
        resident: {
          select: { id: true, name: true, email: true, flatNumber: true, phone: true },
        },
        history: {
          include: {
            actor: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const threshold = await getOverdueThresholdDays();
    const enriched = enrichComplaintWithOverdue(updatedComplaint, threshold);

    res.json({
      message: `Complaint priority updated to ${priority}`,
      complaint: enriched,
    });
  } catch (error: any) {
    console.error("Update priority error:", error);
    res.status(500).json({ message: "Failed to update complaint priority", error: error.message });
  }
}
