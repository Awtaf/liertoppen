import { NextResponse } from "next/server";
import {
  validateContactForm,
  hasErrors,
  buildContactSubject,
  buildContactMessageLines,
  type ContactFormData,
} from "@/lib/contact";
import { sendAdminNotification } from "@/lib/mailer";

/**
 * Server-side email delivery via SMTP (works with the company's existing
 * mailbox — e.g. Webhuset — or any other SMTP provider). Configured with
 * environment variables so no credentials are hardcoded:
 *
 *   SMTP_HOST     e.g. send.webhuset.no
 *   SMTP_PORT     e.g. 587
 *   SMTP_USER     the mailbox address, e.g. post@ostfoldbud.no
 *   SMTP_PASSWORD the mailbox password
 *
 * Until all four are set (e.g. in Vercel → Settings → Environment
 * Variables), this route cannot send anything on its own — it only logs
 * the submission, and ContactForm.tsx falls back to opening a mailto:
 * link so the visitor can send it manually. Once the variables are set,
 * delivery becomes fully automatic and no code changes are needed.
 * See lib/mailer.ts for the shared transporter logic (also used by the
 * /tilbud lead notifications).
 */
export async function POST(request: Request) {
  let body: Partial<ContactFormData>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Ugyldig forespørsel." },
      { status: 400 }
    );
  }

  const data: ContactFormData = {
    name: body.name ?? "",
    company: body.company ?? "",
    phone: body.phone ?? "",
    email: body.email ?? "",
    jobType: body.jobType ?? "",
    area: body.area ?? "",
    desiredStart: body.desiredStart ?? "",
    message: body.message ?? "",
    consent: body.consent ?? false,
    website: body.website ?? "",
  };

  // Honeypot: real users never fill this hidden field in.
  if (data.website.trim().length > 0) {
    return NextResponse.json({ message: "Mottatt.", sent: false }, { status: 200 });
  }

  const errors = validateContactForm(data);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { message: "Skjemaet inneholder feil.", errors, sent: false },
      { status: 400 }
    );
  }

  console.info("Ny kontaktforespørsel mottatt:", {
    name: data.name,
    company: data.company,
    phone: data.phone,
    email: data.email,
    jobType: data.jobType,
    area: data.area,
    desiredStart: data.desiredStart,
    message: data.message,
  });

  const sent = await sendAdminNotification({
    subject: buildContactSubject(data),
    text: buildContactMessageLines(data).join("\n"),
    replyTo: data.email,
  });

  return NextResponse.json(
    {
      message: sent
        ? "Henvendelsen er sendt."
        : "Henvendelsen er mottatt, men ikke sendt automatisk.",
      sent,
    },
    { status: 200 }
  );
}
