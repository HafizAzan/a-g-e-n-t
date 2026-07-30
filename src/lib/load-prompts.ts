import { readdir, readFile } from "fs/promises";
import path from "path";

/**
 * Required prompt files, in the exact order they must appear
 * in the combined system prompt. Filenames on disk may have
 * numeric prefixes (e.g. 01-system-rule.md).
 */
export const REQUIRED_PROMPT_FILES = [
  "system-rule.md",
  "business-rules.md",
  "search-strategy.md",
  "data-accuracy.md",
  "not-duplicate.md",
  "lead-scoring.md",
  "email-generation.md",
  "output-format.md",
] as const;

const PROMPTS_DIR = path.join(process.cwd(), "src", "prompts");

function findMatchingFile(
  availableFiles: string[],
  requiredName: string
): string | undefined {
  const lowerRequired = requiredName.toLowerCase();

  return availableFiles.find((file) => {
    const lower = file.toLowerCase();
    return lower === lowerRequired || lower.endsWith(`-${lowerRequired}`);
  });
}

/**
 * Reads every markdown file in src/prompts/ on each call (no cache).
 * Combines them into one system prompt with section headers.
 */
export async function loadCombinedSystemPrompt(): Promise<string> {
  let entries: string[];

  try {
    entries = await readdir(PROMPTS_DIR);
  } catch {
    throw new Error(
      `Prompts folder not found at ${PROMPTS_DIR}. Create src/prompts/ and add the required markdown files.`
    );
  }

  const markdownFiles = entries.filter((file) =>
    file.toLowerCase().endsWith(".md")
  );

  if (markdownFiles.length === 0) {
    throw new Error(`No markdown prompt files found in ${PROMPTS_DIR}.`);
  }

  const orderedFiles: string[] = [];
  const used = new Set<string>();

  for (const requiredName of REQUIRED_PROMPT_FILES) {
    const match = findMatchingFile(markdownFiles, requiredName);

    if (!match) {
      throw new Error(
        `Required prompt file missing: ${requiredName}. Expected a file named "${requiredName}" or ending with "-${requiredName}" inside src/prompts/.`
      );
    }

    orderedFiles.push(match);
    used.add(match);
  }

  const extras = markdownFiles
    .filter((file) => !used.has(file))
    .sort((a, b) => a.localeCompare(b));

  orderedFiles.push(...extras);

  const sections: string[] = [];

  for (const fileName of orderedFiles) {
    const fullPath = path.join(PROMPTS_DIR, fileName);
    const content = await readFile(fullPath, "utf8");

    sections.push(
      [
        "====================",
        fileName,
        "====================",
        "",
        content.trim(),
      ].join("\n")
    );
  }

  return sections.join("\n\n");
}
