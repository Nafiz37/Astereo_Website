import { redirect } from "next/navigation";
import { getLang } from "@/i18n/server";
import { localizeHref } from "@/i18n/config";

/** Old email links pointed here. They now land on the full manage page (reschedule or cancel). */
export default async function LegacyCancel({ searchParams }: { searchParams: Promise<{ id?: string; token?: string }> }) {
  const [lang, { id = "", token = "" }] = await Promise.all([getLang(), searchParams]);
  redirect(`${localizeHref("/get-started/manage", lang)}?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`);
}
