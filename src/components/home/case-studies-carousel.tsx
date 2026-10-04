"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Carousel({ children, label }: { children: ReactNode[]; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  return (
    <div className="relative">
      <div className="mb-4 flex justify-end gap-2">
        <button type="button" onClick={() => scroll(-1)} aria-label={`Previous ${label}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary">
          <ChevronLeft className="h-5 w-5" />
        </button>