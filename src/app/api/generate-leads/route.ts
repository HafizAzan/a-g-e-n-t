import { generateLeadsWithCursor } from '@/lib/cursor';
import type { GenerateLeadsRequest } from '@/types/lead';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 300;

function validateBody(body: unknown): GenerateLeadsRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be a JSON object.');
  }

  const data = body as Record<string, unknown>;
  const prompt = typeof data.prompt === 'string' ? data.prompt.trim() : '';
  const country = typeof data.country === 'string' ? data.country.trim() : '';
  const city = typeof data.city === 'string' ? data.city.trim() : '';
  const limitRaw = data.limit;
  const limit =
    typeof limitRaw === 'number' ? limitRaw : typeof limitRaw === 'string' ? Number(limitRaw) : NaN;

  if (!prompt) {
    throw new Error('Prompt is required.');
  }
  if (!Number.isFinite(limit) || limit < 1 || limit > 50) {
    throw new Error('Limit must be a number between 1 and 50.');
  }

  return { prompt, country, city, limit: Math.floor(limit) };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = validateBody(body);
    const leads = await generateLeadsWithCursor(input);
    return NextResponse.json({ leads });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate leads.";

    let status = 500;
    if (
      message.includes("required") ||
      message.includes("must be") ||
      message.includes("Limit must")
    ) {
      status = 400;
    } else if (
      message.includes("prompt file") ||
      message.includes("Prompts folder") ||
      message.includes("markdown prompt")
    ) {
      status = 500;
    } else if (
      message.includes("Cursor") ||
      message.includes("AI response") ||
      message.includes("validation failed")
    ) {
      status = 502;
    }

    return NextResponse.json({ error: message }, { status });
  }
}
