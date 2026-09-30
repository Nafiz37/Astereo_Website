import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Link from "@/components/ui/link";
import { LogoutButton } from "@/components/admin/logout-button";
import { Logo } from "@/components/ui/logo";
import { getAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Astareo Admin" }, robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#0a0f1e", colorScheme: "dark", width: "device-width", initialScale: 1 };
export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/consultations", label: "Consultations" },
  { href: "/admin/chats", label: "AI chats" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body>
    <div className="min-h-screen">
      {admin && (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <div className="container flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
            <Link href="/admin" aria-label="Admin home"><Logo /></Link>
            <nav aria-label="Admin" className="flex flex-1 flex-wrap gap-1 text-sm">
              {links.map((l) => <Link key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">{l.label}</Link>)}
            </nav>
            <span className="hidden text-xs text-muted-foreground md:inline">{admin.email}</span>
            <LogoutButton />
          </div>
        </header>
      )}
      <main id="main" className="container py-8">{children}</main>
    </div>
      </body>
    </html>
  );
}
