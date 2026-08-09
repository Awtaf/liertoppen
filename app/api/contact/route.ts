import { NextResponse } from "next/server";
import {
  validateContactForm,
  hasErrors,
  type ContactFormData,
} from "@/lib/contact";

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
    return NextResponse.json({ message: "Mottatt." }, { status: 200 });
  }

  const errors = validateContactForm(data);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { message: "Skjemaet inneholder feil.", errors },
      { status: 400 }
    );
  }

  // The submission is validated at this point and logged here as a
  // best-effort backup record. The actual delivery to the visitor right now
  // happens client-side via a mailto: link (see ContactForm.tsx /
  // buildContactMailto in lib/contact.ts) — no email provider is connected
  // to this route yet, so nothing below sends anything on its own.
  //
  // TODO: Connect a real email provider here for fully automatic delivery
  // that doesn't depend on the visitor's own email client. Do not report
  // success to the user from this route alone unless the message has
  // actually been delivered somewhere.
  // Example using Resend (https://resend.com):
  //
  //   import { Resend } from "resend";
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: "Østfold Bud Service AS <post@ostfoldbud.no>",
  //     to: companyInfo.email,
  //     replyTo: data.email,
  //     subject: `Ny henvendelse fra ${data.name}`,
  //     text: `...`,
  //   });
  //
  // Nodemailer and SendGrid work the same way: build the message from
  // `data` below and send it here. Store provider credentials as
  // environment variables (see README.md), never hardcoded.
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

  return NextResponse.json(
    { message: "Henvendelsen er mottatt." },
    { status: 200 }
  );
}
