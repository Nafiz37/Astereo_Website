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