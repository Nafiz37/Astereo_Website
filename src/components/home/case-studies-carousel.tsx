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
        <button type="button" onClick={() => scroll(1)} aria-label={`Next ${label}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <ul ref={ref} className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden" tabIndex={0} aria-label={label}>
        {children.map((c, i) => (
          <li key={i} className="relative w-[85%] shrink-0 snap-start sm:w-[380px]">
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
