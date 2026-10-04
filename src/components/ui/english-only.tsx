import { Languages } from "lucide-react";
import { getDict, getLang } from "@/i18n/server";

/** Shown on Bangla pages whose long-form body is only available in English (blog, docs, whitepapers, legal). */
export async function EnglishOnlyNotice() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  if (lang === "en") return null;
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground" role="note">
      <Languages className="h-4 w-4 shrink-0 text-primary" />
      <p lang="bn">{d.common.englishOnly}</p>
    </div>
  );
}
