/* Thin wrapper over Chrome's built-in AI APIs. Orbit ships and downloads no model of its own. */

export type AiAvailability = "unsupported" | "unavailable" | "downloadable" | "downloading" | "available";

interface Monitor {
  addEventListener(type: "downloadprogress", cb: (e: { loaded: number }) => void): void;
}

interface AiSession {
  destroy?: () => void;
}

interface SummarizerSession extends AiSession {
  inputQuota?: number;
  summarize(text: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
}

interface TranslatorSession extends AiSession {
  translate(text: string, options?: { signal?: AbortSignal }): Promise<string>;
}

interface DetectorSession extends AiSession {
  detect(text: string): Promise<{ detectedLanguage: string; confidence: number }[]>;
}

// biome-ignore lint/suspicious/noExplicitAny: the APIs are not in the DOM typings yet
const g = globalThis as any;

const FLAG_KEY = "orbit:experimental-ai";

export function aiFlagEnabled(): boolean {
  try {
    return localStorage.getItem(FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAiFlag(enabled: boolean) {
  try {
    if (enabled) localStorage.setItem(FLAG_KEY, "1");
    else localStorage.removeItem(FLAG_KEY);
  } catch {
    /* storage can be blocked; the flag then stays off */
  }
}

export const hasSummarizer = () => typeof g.Summarizer !== "undefined";
export const hasTranslator = () => typeof g.Translator !== "undefined";

export async function summarizerAvailability(): Promise<AiAvailability> {
  if (!hasSummarizer()) return "unsupported";
  try {
    return await g.Summarizer.availability();
  } catch {
    return "unavailable";
  }
}

export async function translatorAvailability(source: string, target: string): Promise<AiAvailability> {
  if (!hasTranslator()) return "unsupported";
  try {
    return await g.Translator.availability({ sourceLanguage: source, targetLanguage: target });
  } catch {
    return "unavailable";
  }
}

const monitorFor = (onProgress?: (fraction: number) => void) => (m: Monitor) => {
  m.addEventListener("downloadprogress", (e) => onProgress?.(e.loaded));
};

export async function createSummarizer(
  options: { type?: "tldr" | "key-points" | "teaser" | "headline"; length?: "short" | "medium" | "long"; context?: string },
  onProgress?: (fraction: number) => void
): Promise<SummarizerSession> {
  return g.Summarizer.create({
    type: options.type ?? "key-points",
    format: "plain-text",
    length: options.length ?? "medium",
    sharedContext: options.context,
    outputLanguage: "en",
    monitor: monitorFor(onProgress),
  });
}

export async function createTranslator(source: string, target: string, onProgress?: (fraction: number) => void): Promise<TranslatorSession> {
  return g.Translator.create({ sourceLanguage: source, targetLanguage: target, monitor: monitorFor(onProgress) });
}

export async function detectLanguage(text: string): Promise<string | null> {
  if (typeof g.LanguageDetector === "undefined") return null;
  try {
    const detector: DetectorSession = await g.LanguageDetector.create();
    const result = await detector.detect(text.slice(0, 2000));
    detector.destroy?.();
    return result[0]?.confidence > 0.5 ? result[0].detectedLanguage : null;
  } catch {
    return null;
  }
}

/** Splits text on paragraph breaks into pieces of at most `size` characters. */
export function chunkText(text: string, size: number): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const para of text.split(/\n{2,}/)) {
    if ((current + "\n\n" + para).length > size && current) {
      chunks.push(current);
      current = "";
    }
    if (para.length > size) {
      for (let i = 0; i < para.length; i += size) chunks.push(para.slice(i, i + size));
    } else current = current ? `${current}\n\n${para}` : para;
  }
  if (current) chunks.push(current);
  return chunks;
}
