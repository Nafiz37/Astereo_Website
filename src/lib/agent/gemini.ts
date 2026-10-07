import { GoogleGenAI, type Content, type FunctionDeclaration } from "@google/genai";
import type { AgentContent, AgentPart, ModelFn } from "./core";
import { toolDeclarations } from "./tools";

export const geminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

let client: GoogleGenAI | undefined;
const getClient = () => (client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }));

const errorText = (err: unknown) => `${(err as { status?: number })?.status ?? ""} ${(err as Error)?.message ?? ""}`;

/** Quota / rate limit: retrying the SAME model will not help (free-tier limits are per model and per day). */
export function isQuota(err: unknown) {
  return /\b429\b|RESOURCE_EXHAUSTED|exceeded your current quota/i.test(errorText(err));
}

/** Temporary overload worth retrying with backoff: 5xx / "high demand". */
export function isTransient(err: unknown) {
  return !isQuota(err) && /\b(500|502|503|504)\b|UNAVAILABLE|high demand/i.test(errorText(err));
}

/** Retries `fn` with exponential backoff on transient (overload) errors only. */
export async function withRetry<T>(fn: () => Promise<T>, { attempts = 3, baseMs = 800 }: { attempts?: number; baseMs?: number } = {}): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= attempts - 1 || !isTransient(err)) throw err;
      await new Promise((r) => setTimeout(r, baseMs * 2 ** i + Math.random() * 250));
    }
  }
}

/**
 * Models to try, in order. The default is the "lite" model first because it has the most generous free-tier quota;
 * set GEMINI_MODEL to a stronger model for production on a paid key, and GEMINI_FALLBACK_MODEL for the backup.
 */
export function modelChain(env: Record<string, string | undefined> = process.env) {
  const primary = env.GEMINI_MODEL?.trim() || "gemini-flash-lite-latest";
  const fallback = env.GEMINI_FALLBACK_MODEL?.trim() || (primary === "gemini-flash-latest" ? "gemini-flash-lite-latest" : "gemini-flash-latest");
  return primary === fallback ? [primary] : [primary, fallback];
}

/** Opens a stream on the first model that accepts the request; moves to the next one on quota/overload errors. */
export async function openStream<S>(models: string[], open: (model: string) => Promise<S>): Promise<S> {
  let last: unknown;
  for (const model of models) {
    try {
      return await withRetry(() => open(model));
    } catch (err) {
      last = err;
      if (!isQuota(err) && !isTransient(err)) throw err; // a real request error: another model won't fix it
      console.warn(`[gemini] ${model} unavailable (${isQuota(err) ? "quota" : "overloaded"}); trying next model`);
    }
  }
  throw last;
}

/** Gemini adapter for the agent loop. */
export function geminiModel(systemInstruction: string): ModelFn {
  return async function* (contents: AgentContent[], signal?: AbortSignal) {
    // Only the connection/first-byte phase is retried or switched; once chunks flow they are never replayed.
    const stream = await openStream(modelChain(), (model) =>
      getClient().models.generateContentStream({
        model,
        contents: contents as Content[],
        config: {
          systemInstruction,
          temperature: 0.4,
          maxOutputTokens: 900,
          tools: [{ functionDeclarations: toolDeclarations as unknown as FunctionDeclaration[] }],
          abortSignal: signal,
        },
      }),
    );
    for await (const chunk of stream) {
      const parts = (chunk.candidates?.[0]?.content?.parts ?? []) as AgentPart[];
      if (parts.length) yield { parts };
    }
  };
}
