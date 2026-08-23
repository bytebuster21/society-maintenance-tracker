import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("?? Starting database seeding...");

  // Clean existing data
  await prisma.complaintHistory.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("admin123", 10);
  const residentPassHash = await bcrypt.hash("resident123", 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Admin Officer (Society Desk)",
      email: "admin@society.com",
      password: passwordHash,
      role: "ADMIN",
      phone: "+91 98765 43210",
      flatNumber: "Admin Office, Block A",
    },
  });

  const resident1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@society.com",
      password: residentPassHash,
      role: "RESIDENT",
      phone: "+91 98111 22233",
      flatNumber: "A-302",
    },
  });

  const resident2 = await prisma.user.create({
    data: {
      name: "Sarah Smith",
      email: "sarah.smith@society.com",
      password: residentPassHash,
      role: "RESIDENT",
      phone: "+91 98444 55566",
      flatNumber: "B-504",
    },
  });

  const resident3 = await prisma.user.create({
    data: {
      name: "Rohit Sharma",
      email: "rohit.sharma@society.com",
      password: residentPassHash,
      role: "RESIDENT",
      phone: "+91 98777 88899",
      flatNumber: "C-101",
    },
  });

  console.log("? Seeded Users: Admin and 3 Residents");

  // 2. Settings
  await prisma.setting.create({
    data: {
      key: "OVERDUE_THRESHOLD_DAYS",
      value: "3",
      description: "Days past which an unresolved complaint is deemed overdue",
    },
  });

  // 3. Complaints & History
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  // Overdue Complaint 1 (Lift Issue - Open for 6 days)
  const c1 = await prisma.complaint.create({
    data: {
      title: "Passenger Lift 2 Malfunctioning & Jerking",
      description: "Lift 2 in Block A makes heavy grinding noise and gets stuck between 4th and 5th floor intermittently. Needs urgent inspection by Otis technician.",
      category: "Lift",
      flatNumber: "A-302",
      priority: "HIGH",
      status: "OPEN",
      residentId: resident1.id,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(6),
      history: {
        create: [
          {
            actorId: resident1.id,
            action: "CREATED",
            toStatus: "OPEN",
            toPriority: "HIGH",
            note: "Initial complaint raised with high urgency",
            createdAt: daysAgo(6),
          },
        ],
      },
    },
  });

  // Overdue Complaint 2 (Main Water Pipe Leakage - In Progress for 4 days)
  const c2 = await prisma.complaint.create({
    data: {
      title: "Main Overhead Water Pipe Leakage in Basement",
      description: "Continuous water dripping near parking slot B-14 from the overhead distribution valve. Potential slip hazard and water wastage.",
      category: "Plumbing",
      flatNumber: "B-504",
      priority: "HIGH",
      status: "IN_PROGRESS",
      residentId: resident2.id,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(2),
      history: {
        create: [
          {
            actorId: resident2.id,
            action: "CREATED",
            toStatus: "OPEN",
            toPriority: "HIGH",
            note: "Water leakage reported near parking",
            createdAt: daysAgo(5),
          },
          {
            actorId: admin.id,
            action: "STATUS_CHANGE",
            fromStatus: "OPEN",
            toStatus: "IN_PROGRESS",
            note: "Assigned to plumbings vendor team (QuickFix Solutions). Awaiting replacement valve.",
            createdAt: daysAgo(2),
          },
        ],
      },
    },
  });

  // Active Complaint 3 (Electrical Corridor Light - Open 1 day ago)
  const c3 = await prisma.complaint.create({
    data: {
      title: "Flickering Tube Lights in 3rd Floor Corridor",
      description: "Two LED panel lights outside flat 301 and 302 are flickering continuously since yesterday night.",
      category: "Electrical",
      flatNumber: "A-302",
      priority: "MEDIUM",
      status: "OPEN",
      residentId: resident1.id,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
      history: {
        create: [
          {
            actorId: resident1.id,
            action: "CREATED",
            toStatus: "OPEN",
            toPriority: "MEDIUM",
            note: "Complaint submitted",
            createdAt: daysAgo(1),
          },
        ],
      },
    },
  });

  // Active Complaint 4 (Intercom Not Working - In Progress 2 days ago)
  const c4 = await prisma.complaint.create({
    data: {
      title: "Main Gate Intercom Line Disconnected",
      description: "No audio or dial tone on flat intercom to security guard gate.",
      category: "Security",
      flatNumber: "C-101",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      residentId: resident3.id,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
      history: {
        create: [
          {
            actorId: resident3.id,
            action: "CREATED",
            toStatus: "OPEN",
            toPriority: "MEDIUM",
            note: "Intercom issue raised",
            createdAt: daysAgo(2),
          },
          {
            actorId: admin.id,
            action: "STATUS_CHANGE",
            fromStatus: "OPEN",
            toStatus: "IN_PROGRESS",
            note: "Technician visiting tomorrow afternoon between 2 PM to 5 PM.",
            createdAt: daysAgo(1),
          },
        ],
      },
    },
  });

  // Resolved Complaint 5 (Gym AC Service - Resolved)
  const c5 = await prisma.complaint.create({
    data: {
      title: "Clubhouse Gymnasium Air Conditioner Not Cooling",
      description: "Both split AC units in gym area running on fan mode without cooling.",
      category: "Common Area",
      flatNumber: "B-504",
      priority: "LOW",
      status: "RESOLVED",
      residentId: resident2.id,
      createdAt: daysAgo(7),
      updatedAt: daysAgo(3),
      resolvedAt: daysAgo(3),
      history: {
        create: [
          {
            actorId: resident2.id,
            action: "CREATED",
            toStatus: "OPEN",
            toPriority: "LOW",
            note: "Gym AC reported",
            createdAt: daysAgo(7),
          },
          {
            actorId: admin.id,
            action: "STATUS_CHANGE",
            fromStatus: "OPEN",
            toStatus: "IN_PROGRESS",
            note: "Daikin service engineer scheduled for gas recharge.",
            createdAt: daysAgo(5),
          },
          {
            actorId: admin.id,
            action: "STATUS_CHANGE",
            fromStatus: "IN_PROGRESS",
            toStatus: "RESOLVED",
            note: "Gas refilled and cooling filters replaced. Fully functional.",
            createdAt: daysAgo(3),
          },
        ],
      },
    },
  });

  console.log("? Seeded Complaints with Realistic History Trails");

  // 4. Notices
  await prisma.notice.create({
    data: {
      title: "?? Scheduled Power Backup & DG Testing on Sunday",
      content: "Please be informed that regular diesel generator load testing and electrical grid maintenance will take place this Sunday between 10:00 AM to 1:00 PM. Lifts and common area utilities will be on generator backup. Please avoid using heavy appliances during this window.",
      category: "EMERGENCY",
      isImportant: true,
      authorId: admin.id,
      createdAt: daysAgo(1),
    },
  });

  await prisma.notice.create({
    data: {
      title: "?? Water Tank Cleaning Schedule for Block A, B & C",
      content: "Underground and rooftop overhead water tanks will undergo bi-annual automated pressure washing and chlorination from Wednesday to Friday next week. Detailed schedule: Block A on Wed, Block B on Thu, Block C on Fri.",
      category: "MAINTENANCE",
      isImportant: true,
      authorId: admin.id,
      createdAt: daysAgo(3),
    },
  });

  await prisma.notice.create({
    data: {
      title: "?? Annual Society Diwali Festival & Cultural Evening",
      content: "Join us with family at the Central Amphitheatre for our annual cultural evening featuring musical performances, games for kids, and dinner banquet. Passes available at society office desk.",
      category: "EVENT",
      isImportant: false,
      authorId: admin.id,
      createdAt: daysAgo(5),
    },
  });

  await prisma.notice.create({
    data: {
      title: "??? New Visitor Management Protocol & QR Gate Pass",
      content: "All delivery personnel and domestic helpers will now be verified via MyGate OTP / QR digital entry at Gate 1 and Gate 2. Please update your flat member details in the society app.",
      category: "SECURITY",
      isImportant: false,
      authorId: admin.id,
      createdAt: daysAgo(7),
    },
  });

  console.log("? Seeded Notices (Important Pinned + Regular)");
  console.log("? Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
