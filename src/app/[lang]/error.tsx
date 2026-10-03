"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDict } from "@/i18n/client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const d = useDict();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-3xl font-semibold">{d.pages.error.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">{d.pages.error.body}</p>
        <Button className="mt-6" onClick={reset}>{d.pages.error.retry}</Button>
      </div>
    </main>
  );
}
