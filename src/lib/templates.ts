import type { EmailTemplate } from "@/types/outreach";

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "website-redesign",
    name: "Website Redesign",
    subjectHint: "Quick idea for {{businessName}}'s website",
    offer:
      "I help local businesses redesign outdated websites so they look modern, load faster, and convert more visitors into customers.",
    callToAction:
      "Would you be open to a quick 10-minute call this week so I can show you 2-3 ideas specific to your business?",
    signature: "Best regards,\nYour Name\nWeb Designer",
  },
  {
    id: "seo",
    name: "SEO",
    subjectHint: "Helping {{businessName}} get found online",
    offer:
      "I help businesses improve local SEO so the right customers can find them on Google without paying for ads every day.",
    callToAction:
      "If useful, I can send a short checklist of SEO opportunities I noticed for your business.",
    signature: "Best regards,\nYour Name\nSEO Specialist",
  },
  {
    id: "automation",
    name: "Automation",
    subjectHint: "Save time at {{businessName}} with simple automation",
    offer:
      "I build simple automations that cut repetitive admin work so teams can focus on customers instead of busywork.",
    callToAction:
      "Would you like me to share one automation idea tailored to your workflow?",
    signature: "Best regards,\nYour Name\nAutomation Consultant",
  },
  {
    id: "ai-chatbot",
    name: "AI Chatbot",
    subjectHint: "An AI assistant idea for {{businessName}}",
    offer:
      "I set up AI chat assistants that answer common questions, capture leads, and help customers 24/7.",
    callToAction:
      "Curious if a simple chatbot on your site or WhatsApp would help your team?",
    signature: "Best regards,\nYour Name\nAI Solutions",
  },
  {
    id: "custom",
    name: "Custom",
    subjectHint: "Idea for {{businessName}}",
    offer: "I help businesses grow with practical digital solutions.",
    callToAction: "Would you be open to a short conversation this week?",
    signature: "Best regards,\nYour Name",
  },
];

const STORAGE_KEY = "ai-lead-finder-email-templates";

export function loadTemplates(): EmailTemplate[] {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    const parsed = JSON.parse(raw) as EmailTemplate[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_TEMPLATES;
    return parsed;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplates(templates: EmailTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function buildEmailBody(parts: {
  greeting: string;
  introduction: string;
  offer: string;
  callToAction: string;
  signature: string;
}): string {
  return [
    parts.greeting,
    "",
    parts.introduction,
    "",
    parts.offer,
    "",
    parts.callToAction,
    "",
    parts.signature,
  ].join("\n");
}
