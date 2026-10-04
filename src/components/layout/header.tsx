"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, Globe, Menu, Search, X } from "lucide-react";
import Link from "@/components/ui/link";
import { Logo } from "@/components/ui/logo";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { SearchDialog } from "./search-dialog";
import { cn } from "@/lib/utils";
import type { NavGroup } from "@/lib/nav";
import { localeMeta, localizeHref, locales, stripLocale } from "@/i18n/config";
import { useDict, useLang } from "@/i18n/client";

export function Header({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const d = useDict();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (adjust state during render instead of in an effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(null);
    setMobile(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  const hoverOpen = useCallback((label: string) => {
    clearTimeout(closeTimer.current);
    setOpen(label);
  }, []);
  const hoverClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 150);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled || mobile ? "border-b border-border/50 bg-background/85 py-2.5 backdrop-blur-xl" : "bg-transparent py-3")}>
      <div className="container">
        <nav className="flex items-center justify-between gap-4" aria-label="Main">
          <Link href="/" aria-label={d.nav.homeAria} className="shrink-0">
            <Logo />
          </Link>

          <div className="hidden items-center gap-0.5 lg:flex">
            {groups.map((g) =>
              g.items ? (
                <div key={g.label} className="relative" onMouseEnter={() => hoverOpen(g.label)} onMouseLeave={hoverClose}>
                  <button
                    type="button"
                    aria-expanded={open === g.label}
                    aria-haspopup="true"
                    onClick={() => setOpen(open === g.label ? null : g.label)}
                    className={cn("flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:text-foreground xl:px-3", open === g.label ? "text-foreground" : "text-foreground/70")}
                  >
                    {g.label}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open === g.label && "rotate-180")} />
                  </button>
                  {open === g.label && (
                    <div className={cn("absolute top-full pt-2", g.items.length > 6 ? "-left-24" : "left-0")}>
                      <div className={cn("rounded-xl border border-border/70 bg-popover/95 p-2 shadow-2xl backdrop-blur-xl", g.items.length > 6 ? "grid w-[620px] grid-cols-2 gap-1" : "w-72")}>
                        {g.items.map((it) => (
                          <Link key={it.href} href={it.href} className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary">
                            {it.icon && (
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon name={it.icon} className="h-4 w-4" />
                              </span>
                            )}
                            <span>
                              <span className="block text-sm font-semibold">{it.label}</span>
                              {it.desc && <span className="block text-xs text-muted-foreground">{it.desc}</span>}
                            </span>
                          </Link>
                        ))}
                        {g.footer && (
                          <Link href={g.footer.href} className={cn("mt-1 flex items-center justify-between rounded-lg bg-gradient-to-r from-primary/15 to-brand-purple/15 px-3 py-3 text-sm font-semibold", g.items.length > 6 && "col-span-2")}>
                            <span>
                              {g.footer.label}
                              <span className="block text-xs font-normal text-muted-foreground">{g.footer.desc}</span>
                            </span>
                            <span className="flex items-center gap-1 text-primary">
                              {d.common.learnMoreCaps} <ArrowRight className="h-4 w-4" />
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={g.label} href={g.href!} className={cn("rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:text-foreground xl:px-3", stripLocale(pathname) === g.href ? "text-foreground" : "text-foreground/70")}>
                  {g.label}
                </Link>
              ),
            )}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageMenu />
            <button type="button" onClick={() => setSearchOpen(true)} className="p-2 text-foreground/70 transition-colors hover:text-foreground" aria-label={d.nav.search}>
              <Search className="h-4 w-4" />
            </button>
            <ButtonLink href="/contact" variant="ghost" size="sm" className="hidden xl:inline-flex">
              {d.common.contactSales}
            </ButtonLink>
            <ButtonLink href="/get-started" size="sm">
              {d.common.getStarted}
            </ButtonLink>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <LanguageMenu compact />
            <button type="button" onClick={() => setSearchOpen(true)} className="p-2 text-foreground" aria-label={d.nav.search}>
              <Search className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setMobile((v) => !v)} className="p-2 text-foreground" aria-label={mobile ? d.nav.closeMenu : d.nav.openMenu} aria-expanded={mobile}>
              {mobile ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </div>

      {mobile && <MobileMenu groups={groups} />}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function MobileMenu({ groups }: { groups: NavGroup[] }) {
  const d = useDict();
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="container max-h-[calc(100vh-4rem)] overflow-y-auto pb-8 pt-4 lg:hidden">
      <ul className="space-y-1">
        {groups.map((g) => (
          <li key={g.label}>
            {g.items ? (
              <>
                <button type="button" onClick={() => setExpanded(expanded === g.label ? null : g.label)} aria-expanded={expanded === g.label} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium hover:bg-secondary">
                  {g.label}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", expanded === g.label && "rotate-180")} />
                </button>
                {expanded === g.label && (
                  <ul className="mb-2 ml-3 space-y-0.5 border-l border-border pl-3">
                    {g.items.map((it) => (
                      <li key={it.href}>
                        <Link href={it.href} className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-secondary">
                          {it.label}
                        </Link>
                      </li>
                    ))}
                    {g.footer && (
                      <li>
                        <Link href={g.footer.href} className="block rounded-lg px-3 py-2 text-sm font-semibold text-primary">
                          {g.footer.label} →
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </>
            ) : (
              <Link href={g.href!} className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-secondary">
                {g.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <ButtonLink href="/contact" variant="ghost">
          {d.common.contactSales}
        </ButtonLink>
        <ButtonLink href="/get-started">{d.common.getStarted}</ButtonLink>
      </div>
    </div>
  );
}

/** Switches between /pricing and /bn/pricing, keeping the visitor on the equivalent page. */
function LanguageMenu({ compact = false }: { compact?: boolean }) {
  const d = useDict();
  const lang = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(target: (typeof locales)[number]) {
    setOpen(false);
    if (target === lang) return;
    const base = stripLocale(pathname);
    router.push(localizeHref(base, target) + window.location.search + window.location.hash);
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="true" aria-label={d.nav.language} className="flex items-center gap-1.5 px-2 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground">
        <Globe className="h-4 w-4" />
        {lang === "bn" ? "বাং" : "EN"}
        {!compact && <ChevronDown className="h-3 w-3" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border/70 bg-popover p-1.5 shadow-2xl" role="menu">
          {locales.map((l) => (
            <button key={l} type="button" role="menuitemradio" aria-checked={l === lang} lang={l} onClick={() => choose(l)} className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-secondary", l === lang && "bg-secondary")}>
              {localeMeta[l].native}
              {l === lang && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
