import nodemailer from "nodemailer";
import { ENV } from "../config/env.js";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (ENV.SMTP_HOST && ENV.SMTP_USER && ENV.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_PORT === 465,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  } else {
    // Generate test account on Ethereal automatically for zero-config testing
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email Service] Created ephemeral Ethereal test account: ${testAccount.user}`);
    } catch (err) {
      console.warn("[Email Service] Could not initialize Ethereal transporter, will log to stdout.", err);
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return transporter;
}

export interface StatusEmailParams {
  residentEmail: string;
  residentName: string;
  complaintTitle: string;
  complaintId: string;
  fromStatus?: string | null;
  toStatus: string;
  priority: string;
  note?: string | null;
}

export async function sendComplaintStatusEmail(params: StatusEmailParams): Promise<void> {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: ENV.SMTP_FROM,
      to: params.residentEmail,
      subject: `[Complaint Update] ${params.complaintTitle} is now ${params.toStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; margin-top: 0;">Society Maintenance Update</h2>
          <p>Dear <strong>${params.residentName}</strong>,</p>
          <p>Your maintenance complaint status has been updated by the society administration.</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4f46e5;">
            <p style="margin: 4px 0;"><strong>Complaint:</strong> ${params.complaintTitle}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="font-weight: bold; color: #4f46e5;">${params.toStatus}</span> ${params.fromStatus ? `(Previous: ${params.fromStatus})` : ""}</p>
            <p style="margin: 4px 0;"><strong>Priority:</strong> ${params.priority}</p>
            ${params.note ? `<p style="margin: 8px 0 0; padding-top: 8px; border-top: 1px dashed #cbd5e1;"><strong>Admin Note:</strong> <em>${params.note}</em></p>` : ""}
          </div>
          
          <p>You can track the complete history and details anytime in the resident portal.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #64748b; font-size: 12px;">This is an automated notification from your Society Maintenance Tracker system.</p>
        </div>
      `,
    });

    console.log(`[Email Service] Status update sent to ${params.residentEmail} (ID: ${params.complaintId})`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Preview] ?? View Ethereal Email: ${previewUrl}`);
    }
  } catch (err) {
    console.error("[Email Service] Failed to send status change email:", err);
  }
}

export interface ImportantNoticeParams {
  recipients: Array<{ email: string; name: string }>;
  noticeTitle: string;
  noticeContent: string;
  category: string;
}

export async function sendImportantNoticeBroadcast(params: ImportantNoticeParams): Promise<void> {
  if (!params.recipients.length) return;

  try {
    const mailer = await getTransporter();
    for (const resident of params.recipients) {
      const info = await mailer.sendMail({
        from: ENV.SMTP_FROM,
        to: resident.email,
        subject: `[IMPORTANT NOTICE] ${params.noticeTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fed7aa; border-radius: 8px; background-color: #fffbeb;">
            <div style="display: inline-block; background-color: #ea580c; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-bottom: 12px;">
              IMPORTANT NOTICE • ${params.category}
            </div>
            <h2 style="color: #9a3412; margin-top: 0;">${params.noticeTitle}</h2>
            <p>Dear <strong>${resident.name}</strong>,</p>
            <div style="background-color: #ffffff; padding: 16px; border-radius: 6px; margin: 16px 0; border: 1px solid #fde68a; line-height: 1.6; color: #1e293b;">
              ${params.noticeContent.replace(/\n/g, "<br />")}
            </div>
            <p style="color: #78350f; font-size: 13px;">Please log in to the society notice board for further announcements and updates.</p>
            <hr style="border: none; border-top: 1px solid #fed7aa; margin: 20px 0;" />
            <p style="color: #9a3412; font-size: 12px;">Society Management Office</p>
          </div>
        `,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Preview] ?? Important Notice preview for ${resident.email}: ${previewUrl}`);
      }
    }
  } catch (err) {
    console.error("[Email Service] Failed to send broadcast notice emails:", err);
  }
}
