import { describe, expect, it, vi } from "vitest";
import { runAgent, type AgentContent, type AgentPart, type ModelFn } from "@/lib/agent/core";

/** Scripted model: each model call returns the next scripted turn, streamed as chunks of parts. */
function scripted(turns: AgentPart[][][]): { model: ModelFn; seen: AgentContent[][] } {
  const seen: AgentContent[][] = [];
  let i = 0;
  const model: ModelFn = async function* (contents) {
    seen.push(structuredClone(contents));
    for (const chunk of turns[Math.min(i, turns.length - 1)]) yield { parts: chunk };
    i++;
  };
  return { model, seen };
}

describe("agent loop", () => {
  it("streams text and returns without tools", async () => {
    const { model } = scripted([[[{ text: "Hello " }], [{ text: "there" }]]]);
    const deltas: string[] = [];
    const out = await runAgent({ history: [], userMessage: "hi", model, tools: {}, events: { onText: (d) => deltas.push(d) } });
    expect(out.text).toBe("Hello there");
    expect(deltas).toEqual(["Hello ", "there"]);
  });

  it("executes tool calls, feeds results back and finishes with text", async () => {
    const { model, seen } = scripted([
      [[{ functionCall: { name: "get_services", args: { slug: "lms" } } }]],
      [[{ text: "We build LMS platforms." }]],
    ]);
    const handler = vi.fn(async (args: Record<string, unknown>) => ({ name: "LMS", echo: args.slug }));
    const turns: string[] = [];
    const out = await runAgent({ history: [], userMessage: "what is lms", model, tools: { get_services: handler }, events: { onTurn: (t) => void turns.push(t.role) } });
    expect(handler).toHaveBeenCalledWith({ slug: "lms" });
    expect(out.toolCalls).toEqual(["get_services"]);
    expect(out.text).toBe("We build LMS platforms.");
    expect(turns).toEqual(["model", "tool", "model"]);
    const second = seen[1];
    expect(second[second.length - 1].parts[0].functionResponse?.response).toEqual({ name: "LMS", echo: "lms" });
  });

  it("survives a throwing tool and an unknown tool", async () => {
    const { model, seen } = scripted([
      [[{ functionCall: { name: "boom", args: {} } }, { functionCall: { name: "nope", args: {} } }]],
      [[{ text: "Sorry about that." }]],
    ]);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const out = await runAgent({
      history: [],
      userMessage: "x",
      model,
      tools: {
        boom: async () => {
          throw new Error("db down");
        },
      },
    });
    spy.mockRestore();
    expect(out.text).toBe("Sorry about that.");
    const responses = seen[1][seen[1].length - 1].parts.map((p) => p.functionResponse?.response);
    expect(JSON.stringify(responses)).toContain("The tool failed");
    expect(JSON.stringify(responses)).toContain("Unknown tool");
  });

  it("stops runaway tool loops", async () => {
    const { model } = scripted([[[{ functionCall: { name: "loop", args: {} } }]]]);
    const calls = vi.fn(async () => ({ ok: true }));
    const out = await runAgent({ history: [], userMessage: "x", model, tools: { loop: calls }, maxRounds: 3 });
    expect(calls).toHaveBeenCalledTimes(3);
    expect(out.text).toMatch(/contact form|consultation/i);
  });
});
