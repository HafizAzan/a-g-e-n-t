import type { Lead } from "@/types/lead";
import type { EmailTemplate } from "@/types/outreach";
import { runCursorJson } from "@/lib/cursor-client";
import { buildEmailBody } from "@/lib/templates";

export type GeneratedEmailParts = {
  leadIndex: number;
  subject: string;
  greeting: string;
  introduction: string;
  offer: string;
  callToAction: string;
  signature: string;
  body: string;
};

type GenerateInput = {
  leads: Array<Lead & { leadIndex: number }>;
  template: EmailTemplate;
  senderName: string;
};

export async function generatePersonalizedEmails(
  input: GenerateInput
): Promise<GeneratedEmailParts[]> {
  const payload = await runCursorJson<{
    emails?: Array<Record<string, unknown>>;
  }>(`You write personalized cold outreach emails for a personal internal tool.

Create ONE unique email per lead. Do NOT make emails identical.

Template name: ${input.template.name}
Subject hint: ${input.template.subjectHint}
Offer guidance: ${input.template.offer}
CTA guidance: ${input.template.callToAction}
Default signature: ${input.template.signature}
Sender name: ${input.senderName || "Your Name"}

Use each lead's details:
- Business Name
- Category
- City
- Website Status (MISSING if no website, or note if outdated/poor)
- AI Notes

Every email must be unique — vary the opening, angle, and wording for each lead.
Keep tone natural and non-spammy. Avoid ALL CAPS, excessive exclamation marks, or salesy clichés.

Every email must include:
- subject
- greeting
- personalized introduction
- main offer
- call to action
- signature

Return ONLY valid JSON:
{
  "emails": [
    {
      "leadIndex": 0,
      "subject": "",
      "greeting": "",
      "introduction": "",
      "offer": "",
      "callToAction": "",
      "signature": ""
    }
  ]
}

Leads JSON:
${JSON.stringify(
  input.leads.map((lead) => ({
    leadIndex: lead.leadIndex,
    businessName: lead.businessName,
    category: lead.category,
    city: lead.city,
    country: lead.country,
    website: lead.website || "MISSING",
    aiNotes: lead.aiNotes,
    email: lead.email,
  })),
  null,
  2
)}`);

  const emails = Array.isArray(payload.emails) ? payload.emails : [];

  return emails.map((item) => {
    const leadIndex = Number(item.leadIndex);
    const greeting = String(item.greeting || "");
    const introduction = String(item.introduction || "");
    const offer = String(item.offer || input.template.offer);
    const callToAction = String(
      item.callToAction || input.template.callToAction
    );
    const signature = String(item.signature || input.template.signature);
    const subject = String(item.subject || input.template.subjectHint);

    return {
      leadIndex,
      subject,
      greeting,
      introduction,
      offer,
      callToAction,
      signature,
      body: buildEmailBody({
        greeting,
        introduction,
        offer,
        callToAction,
        signature,
      }),
    };
  });
}

export async function reviewEmailsWithAi(
  drafts: Array<{
    id: string;
    subject: string;
    body: string;
    lead: Lead;
  }>
): Promise<
  Array<{
    id: string;
    reviewNotes: string;
    needsFix: boolean;
    suggestedSubject?: string;
    suggestedBody?: string;
  }>
> {
  const payload = await runCursorJson<{
    reviews?: Array<Record<string, unknown>>;
  }>(`You are reviewing personalized outreach emails before bulk send.

For each draft:
- Check personalization quality
- Check clarity and professionalism
- Suggest improvements if needed
- Keep tone natural and non-spammy

Return ONLY valid JSON:
{
  "reviews": [
    {
      "id": "",
      "reviewNotes": "short review explaining what to improve",
      "needsFix": true,
      "suggestedSubject": "optional improved subject or empty",
      "suggestedBody": "optional improved full body or empty"
    }
  ]
}

Set needsFix to true only when the email should be improved before sending.
Set needsFix to false when the email is already good.

Drafts:
${JSON.stringify(
  drafts.map((d) => ({
    id: d.id,
    businessName: d.lead.businessName,
    category: d.lead.category,
    city: d.lead.city,
    website: d.lead.website || "MISSING",
    aiNotes: d.lead.aiNotes,
    subject: d.subject,
    body: d.body,
  })),
  null,
  2
)}`);

  const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];

  return reviews.map((item) => {
    const suggestedSubject = String(item.suggestedSubject || "") || undefined;
    const suggestedBody = String(item.suggestedBody || "") || undefined;
    const needsFixExplicit = item.needsFix === true || item.needsFix === "true";
    const needsFix =
      needsFixExplicit || Boolean(suggestedSubject || suggestedBody);

    return {
      id: String(item.id || ""),
      reviewNotes: String(item.reviewNotes || item.notes || ""),
      needsFix,
      suggestedSubject,
      suggestedBody,
    };
  });
}

export async function fixEmailWithAi(input: {
  subject: string;
  body: string;
  greeting: string;
  introduction: string;
  offer: string;
  callToAction: string;
  signature: string;
  reviewNotes: string;
  lead: Lead;
}): Promise<{
  subject: string;
  greeting: string;
  introduction: string;
  offer: string;
  callToAction: string;
  signature: string;
  body: string;
}> {
  const payload = await runCursorJson<Record<string, unknown>>(`You fix one outreach email based on review feedback.

Apply the review notes. Keep it personalized, natural, and ready to send.
Return ONLY valid JSON:
{
  "subject": "",
  "greeting": "",
  "introduction": "",
  "offer": "",
  "callToAction": "",
  "signature": "",
  "body": ""
}

Lead:
${JSON.stringify(
  {
    businessName: input.lead.businessName,
    category: input.lead.category,
    city: input.lead.city,
    website: input.lead.website || "MISSING",
    aiNotes: input.lead.aiNotes,
  },
  null,
  2
)}

Current email:
${JSON.stringify(
  {
    subject: input.subject,
    greeting: input.greeting,
    introduction: input.introduction,
    offer: input.offer,
    callToAction: input.callToAction,
    signature: input.signature,
    body: input.body,
  },
  null,
  2
)}

Review notes to apply:
${input.reviewNotes}`);

  const greeting = String(payload.greeting || input.greeting);
  const introduction = String(payload.introduction || input.introduction);
  const offer = String(payload.offer || input.offer);
  const callToAction = String(payload.callToAction || input.callToAction);
  const signature = String(payload.signature || input.signature);
  const subject = String(payload.subject || input.subject);
  const body =
    String(payload.body || "").trim() ||
    buildEmailBody({
      greeting,
      introduction,
      offer,
      callToAction,
      signature,
    });

  return {
    subject,
    greeting,
    introduction,
    offer,
    callToAction,
    signature,
    body,
  };
}
