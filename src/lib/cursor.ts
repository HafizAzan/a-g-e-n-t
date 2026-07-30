import { Agent, CursorAgentError } from "@cursor/sdk";
import type { GenerateLeadsRequest, Lead } from "@/types/lead";
import { loadCombinedSystemPrompt } from "@/lib/load-prompts";
import { parseLeadsFromAiText } from "@/lib/parse-leads";
import { dedupeLeads } from "@/lib/dedupe-leads";

/**
 * Builds only the user message from the form.
 * All AI rules come from src/prompts/*.md — never hardcoded here.
 */
function buildUserMessage(input: GenerateLeadsRequest): string {
  return [
    "Lead generation request:",
    "",
    `Prompt: ${input.prompt}`,
    `Country: ${input.country || "not specified"}`,
    `City: ${input.city || "not specified"}`,
    `Maximum leads: ${input.limit}`,
  ].join("\n");
}

function buildFullPrompt(systemPrompt: string, userMessage: string): string {
  return [
    "SYSTEM PROMPT (follow every section below):",
    "",
    systemPrompt,
    "",
    "====================",
    "USER MESSAGE",
    "====================",
    "",
    userMessage,
  ].join("\n");
}

export async function generateLeadsWithCursor(
  input: GenerateLeadsRequest
): Promise<Lead[]> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "CURSOR_API_KEY is missing. Add it to .env.local and restart the server."
    );
  }

  const modelId = process.env.CURSOR_MODEL?.trim() || "composer-2.5";

  // Always re-read markdown files on each request (no cache).
  const systemPrompt = await loadCombinedSystemPrompt();
  const userMessage = buildUserMessage(input);
  const fullPrompt = buildFullPrompt(systemPrompt, userMessage);

  try {
    const result = await Agent.prompt(fullPrompt, {
      apiKey,
      model: { id: modelId },
      local: {
        cwd: process.cwd(),
        settingSources: [],
      },
    });

    if (result.status === "error") {
      throw new Error(result.error?.message || "Cursor agent run failed.");
    }

    if (!result.result?.trim()) {
      throw new Error("Cursor agent returned an empty response.");
    }

    const parsed = parseLeadsFromAiText(result.result);
    const unique = dedupeLeads(parsed);

    return unique.slice(0, input.limit);
  } catch (error) {
    if (error instanceof CursorAgentError) {
      throw new Error(
        `Cursor API error: ${error.message}${
          error.isRetryable ? " (retryable)" : ""
        }`
      );
    }
    throw error;
  }
}
