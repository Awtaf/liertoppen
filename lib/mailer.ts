import nodemailer from "nodemailer";

/**
 * Shared SMTP mailer, configured via SMTP_HOST / SMTP_PORT / SMTP_USER /
 * SMTP_PASSWORD (see app/api/contact/route.ts for where these come from
 * and how to set them up). Returns null when not fully configured, so
 * callers can degrade gracefully instead of crashing.
 */
export function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !password) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass: password },
  });
}

export async function sendAdminNotification(options: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  const { companyInfo } = await import("@/config/company");

  try {
    await transporter.sendMail({
      from: `"${companyInfo.name}" <${process.env.SMTP_USER}>`,
      to: companyInfo.email,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
    });
    return true;
  } catch (error) {
    console.error("Kunne ikke sende varsel-e-post:", error);
    return false;
  }
}
