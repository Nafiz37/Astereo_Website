import { notFound } from "next/navigation";

/** Any unmatched URL (/bn/anything, /anything) renders the branded, translated 404 from ../../not-found.tsx. */
export default function CatchAll() {
  notFound();
}
