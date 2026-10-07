/**
 * Model-agnostic agent loop.
 *
 * The loop is deliberately independent of any SDK so it can be unit-tested with a scripted model
 * and so the provider can be swapped (Gemini today) without touching business logic.
 */
export type AgentPart = {
  text?: string;
  thought?: boolean;
  thoughtSignature?: string;
  functionCall?: { id?: string; name?: string; args?: Record<string, unknown> };
  functionResponse?: { id?: string; name?: string; response?: Record<string, unknown> };
};
export type AgentContent = { role: "user" | "model"; parts: AgentPart[] };

/** A model call: given the conversation so far, stream back chunks of parts. */
export type ModelFn = (contents: AgentContent[], signal?: AbortSignal) => AsyncIterable<{ parts: AgentPart[] }>;

export type ToolHandler = (args: Record<string, unknown>) => Promise<Record<string, unknown>>;

export type AgentEvents = {
  onText?: (delta: string) => void;
  onToolStart?: (name: string) => void;
  /** Called for every completed turn so the caller can persist it. */
  onTurn?: (turn: { role: "user" | "model" | "tool"; text: string; parts: AgentPart[] }) => Promise<void> | void;
};

export const MAX_TOOL_ROUNDS = 5;

/** Merge streamed parts: concatenate adjacent plain-text parts, keep function calls and signatures intact. */
export function mergeParts(chunks: AgentPart[]): AgentPart[] {
  const out: AgentPart[] = [];
  for (const p of chunks) {
    const last = out[out.length - 1];
    const plain = (x: AgentPart) => typeof x.text === "string" && !x.thought && !x.functionCall && !x.functionResponse;
    if (last && plain(last) && plain(p) && !last.thoughtSignature) {
      last.text += p.text!;
      if (p.thoughtSignature) last.thoughtSignature = p.thoughtSignature;
    } else {
      out.push({ ...p });
    }
  }
  return out;
}

export async function runAgent(opts: {
  history: AgentContent[];
  userMessage: string;
  model: ModelFn;
  tools: Record<string, ToolHandler>;
  events?: AgentEvents;
  signal?: AbortSignal;
  maxRounds?: number;
}): Promise<{ text: string; toolCalls: string[] }> {
  const { model, tools, events = {}, signal } = opts;
  const maxRounds = opts.maxRounds ?? MAX_TOOL_ROUNDS;
  const contents: AgentContent[] = [...opts.history, { role: "user", parts: [{ text: opts.userMessage }] }];
  const toolCalls: string[] = [];
  let finalText = "";

  for (let round = 0; round <= maxRounds; round++) {
    const collected: AgentPart[] = [];
    for await (const chunk of model(contents, signal)) {
      for (const part of chunk.parts ?? []) {
        collected.push(part);
        if (part.text && !part.thought && !part.functionCall) events.onText?.(part.text);
      }
    }
    const parts = mergeParts(collected);
    const text = parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("");
    contents.push({ role: "model", parts });
    await events.onTurn?.({ role: "model", text, parts });
    finalText = text || finalText;

    const calls = parts.filter((p) => p.functionCall?.name);
    if (calls.length === 0) return { text: finalText, toolCalls };
    if (round === maxRounds) break;

    const responses: AgentPart[] = [];
    for (const c of calls) {
      const name = c.functionCall!.name!;
      toolCalls.push(name);
      events.onToolStart?.(name);
      const handler = tools[name];
      let response: Record<string, unknown>;
      if (!handler) {
        response = { error: `Unknown tool "${name}".` };
      } else {
        try {
          response = await handler(c.functionCall!.args ?? {});
        } catch (err) {
          console.error(`[agent] tool ${name} failed`, err);
          response = { error: "The tool failed. Apologise briefly and offer the contact form or phone instead." };
        }
      }
      responses.push({ functionResponse: { id: c.functionCall!.id, name, response } });
    }
    contents.push({ role: "user", parts: responses });
    await events.onTurn?.({ role: "tool", text: "", parts: responses });
  }

  // Safety net: too many tool rounds.
  const fallback = "I'm having trouble completing that. Please use our contact form or book a consultation and the team will help you directly.";
  events.onText?.(fallback);
  await events.onTurn?.({ role: "model", text: fallback, parts: [{ text: fallback }] });
  return { text: fallback, toolCalls };
}
