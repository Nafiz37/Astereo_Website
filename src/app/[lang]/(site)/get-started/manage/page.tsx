import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui/section";
import { getDict } from "@/i18n/server";
import { ManageClient } from "./manage-client";

export const metadata: Metadata = { title: "Manage your consultation", robots: { index: false, follow: false } };

export default async function ManagePage({ searchParams }: { searchParams: Promise<{ id?: string; token?: string }> }) {
  const [d, { id = "", token = "" }] = await Promise.all([getDict(), searchParams]);
  return (
    <>
      <PageHero title={d.pages.manage.title} description={d.pages.manage.desc} />
      <section className="section pt-12">
        <Container className="max-w-3xl">
          <ManageClient id={id} token={token} />
        </Container>
      </section>
    </>
  );
}
