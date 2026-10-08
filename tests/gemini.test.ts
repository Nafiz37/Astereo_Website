import { describe, expect, it, vi } from "vitest";
import { isQuota, isTransient, modelChain, openStream, withRetry } from "@/lib/agent/gemini";

const quota = Object.assign(new Error('{"error":{"code":429,"status":"RESOURCE_EXHAUSTED","message":"You exceeded your current quota"}}'), { status: 429 });
const overload = Object.assign(new Error('{"error":{"code":503,"status":"UNAVAILABLE","message":"high demand"}}'), { status: 503 });
const badRequest = Object.assign(new Error('{"error":{"code":400,"status":"INVALID_ARGUMENT"}}'), { status: 400 });

describe("gemini resilience", () => {
  it("classifies errors", () => {
    expect(isQuota(quota)).toBe(true);
    expect(isTransient(quota)).toBe(false); // retrying a quota error is pointless
    expect(isTransient(overload)).toBe(true);
    expect(isQuota(badRequest) || isTransient(badRequest)).toBe(false);
  });

  it("builds a model chain with a fallback and honours env overrides", () => {
    expect(modelChain({})).toEqual(["gemini-flash-lite-latest", "gemini-flash-latest"]);
    expect(modelChain({ GEMINI_MODEL: "gemini-flash-latest" })).toEqual(["gemini-flash-latest", "gemini-flash-lite-latest"]);
    expect(modelChain({ GEMINI_MODEL: "x", GEMINI_FALLBACK_MODEL: "y" })).toEqual(["x", "y"]);
    expect(modelChain({ GEMINI_MODEL: "x", GEMINI_FALLBACK_MODEL: "x" })).toEqual(["x"]);
  });

  it("retries overloads with backoff but not quota errors", async () => {
    const flaky = vi.fn().mockRejectedValueOnce(overload).mockResolvedValue("ok");
    await expect(withRetry(flaky, { baseMs: 1 })).resolves.toBe("ok");
    expect(flaky).toHaveBeenCalledTimes(2);
    const q = vi.fn().mockRejectedValue(quota);
    await expect(withRetry(q, { baseMs: 1 })).rejects.toBe(quota);
    expect(q).toHaveBeenCalledTimes(1);
  });

  it("falls back to the next model on quota or overload, but not on a real request error", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const open = vi.fn(async (m: string) => {
      if (m === "a") throw quota;
      return `stream-from-${m}`;
    });
    await expect(openStream(["a", "b"], open)).resolves.toBe("stream-from-b");
    expect(open.mock.calls.map((c) => c[0])).toEqual(["a", "b"]);

    const bad = vi.fn(async () => {
      throw badRequest;
    });
    await expect(openStream(["a", "b"], bad)).rejects.toBe(badRequest);
    expect(bad).toHaveBeenCalledTimes(1);

    const allDown = vi.fn(async () => {
      throw quota;
    });
    await expect(openStream(["a", "b"], allDown)).rejects.toBe(quota);
    expect(allDown).toHaveBeenCalledTimes(2);
  });
});
