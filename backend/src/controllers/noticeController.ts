import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { sendImportantNoticeBroadcast } from "../services/emailService.js";

// Get all notices (Important pinned at the top)
export async function getNotices(req: Request, res: Response): Promise<void> {
  try {
    const notices = await prisma.notice.findMany({
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: [
        { isImportant: "desc" },
        { createdAt: "desc" },
      ],
    });

    res.json({ notices });
  } catch (error: any) {
    console.error("Get notices error:", error);
    res.status(500).json({ message: "Failed to fetch notices", error: error.message });
  }
}

// Admin: Create notice
export async function createNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, content, category = "GENERAL", isImportant = false } = req.body;
    const authorId = req.user!.id;

    if (!title || !content) {
      res.status(400).json({ message: "Title and content are required" });
      return;
    }

    const notice = await prisma.notice.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        isImportant: Boolean(isImportant),
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // If marked important, send broadcast emails to all residents
    if (notice.isImportant) {
      const residents = await prisma.user.findMany({
        where: { role: "RESIDENT" },
        select: { email: true, name: true },
      });

      sendImportantNoticeBroadcast({
        recipients: residents,
        noticeTitle: notice.title,
        noticeContent: notice.content,
        category: notice.category,
      }).catch((e) => console.error("Error sending notice broadcast:", e));
    }

    res.status(201).json({
      message: "Notice posted successfully",
      notice,
    });
  } catch (error: any) {
    console.error("Create notice error:", error);
    res.status(500).json({ message: "Failed to post notice", error: error.message });
  }
}

// Admin: Delete notice
export async function deleteNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const existing = await prisma.notice.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ message: "Notice not found" });
      return;
    }

    await prisma.notice.delete({
      where: { id },
    });

    res.json({ message: "Notice deleted successfully" });
  } catch (error: any) {
    console.error("Delete notice error:", error);
    res.status(500).json({ message: "Failed to delete notice", error: error.message });
  }
}
