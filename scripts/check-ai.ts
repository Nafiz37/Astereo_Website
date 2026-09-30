/**
 * Verifies your Gemini API key and that the model supports function calling.
 * Usage: npm run ai:check   (reads GEMINI_API_KEY / GEMINI_MODEL from .env.local)
 */
import { GoogleGenAI, type FunctionDeclaration } from "@google/genai";
import { modelChain, withRetry } from "../src/lib/agent/gemini";

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey");
    process.exit(1);
  }
  const model = modelChain()[0];
  const ai = new GoogleGenAI({ apiKey: key });
  const decl: FunctionDeclaration = {
    name: "get_services",
    description: "List the services Astareo offers.",
    parametersJsonSchema: { type: "object", properties: {} },
  };

  console.log(`Model: ${model}`);
  const res = await withRetry(
    () =>
      ai.models.generateContent({
        model,
        contents: "What services does Astareo offer? Use the tool.",
        config: { tools: [{ functionDeclarations: [decl] }], maxOutputTokens: 200 },
      }),
    { attempts: 5, baseMs: 1500 },
  );
  const calls = res.functionCalls ?? [];
  if (calls.length) console.log("OK - model called tool:", calls.map((c) => c.name).join(", "));
  else console.log("OK - model replied without a tool call:", (res.text ?? "").slice(0, 120));
  process.exit(0);
}

main().catch((err) => {
  console.error("Gemini check failed:", err?.message ?? err);
  process.exit(1);
});
