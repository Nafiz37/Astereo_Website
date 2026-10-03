import { ChatWidget } from "@/components/chat/chat-widget";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { buildNav } from "@/lib/nav";
import { getDict, getLang } from "@/i18n/server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  return (
    <>
      <Header groups={buildNav(d, lang)} />
      <main id="main">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );