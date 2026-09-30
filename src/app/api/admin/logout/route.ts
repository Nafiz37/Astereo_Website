import { destroySession } from "@/lib/auth";
import { fail, ok, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Cross-origin request blocked");
  await destroySession();
  return ok({});
}
