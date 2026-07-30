import { Agent, CursorAgentError } from "@cursor/sdk";

async function runCursorPrompt(prompt: string): Promise<string> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "CURSOR_API_KEY is missing. Add it to .env.local and restart the server."
    );
  }

  const modelId = process.env.CURSOR_MODEL?.trim() || "composer-2.5";

  try {
    const result = await Agent.prompt(prompt, {
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

    return result.result;
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

function extractJsonText(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  const arrayStart = trimmed.indexOf("[");
  const arrayEnd = trimmed.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    return trimmed.slice(arrayStart, arrayEnd + 1);
  }

  return trimmed;
}

export async function runCursorJson<T>(prompt: string): Promise<T> {
  const text = await runCursorPrompt(prompt);
  return JSON.parse(extractJsonText(text)) as T;
}
