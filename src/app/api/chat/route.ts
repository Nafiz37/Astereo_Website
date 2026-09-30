import { handleChat, type ChatEvent } from "@/lib/agent/chat";
import { clientIp, fail, hashIp, readJson, throttle } from "@/lib/http";
import { chatSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Streams newline-delimited JSON events: session, text, tool, done, error. */
export async function POST(req: Request) {
  const limited = await throttle(req, "chat", 20, 600);
  if (limited) return limited;
  const parsed = await readJson(req, chatSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (e: ChatEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
        } catch {
          closed = true;
        }
      };
      try {
        await handleChat({
          sessionId: d.sessionId,
          message: d.message,
          timezone: d.timezone,
          lang: d.lang,
          ipHash: hashIp(clientIp(req)),
          userAgent: req.headers.get("user-agent") ?? undefined,
          emit,
          signal: req.signal,
        });
      } catch (err) {
        console.error("[chat] fatal", err);
        emit({ t: "error", message: "Something went wrong. Please try again." });
      } finally {