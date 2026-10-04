import { Container } from "@/components/ui/section";
import { ecosystem } from "@/content/site";
import { getDict } from "@/i18n/server";

export async function Ecosystem() {
  const d = await getDict();
  const title = ecosystem.clientsVerified ? d.ecosystem.titleVerified : d.ecosystem.titleHonest;
  const loop = [...ecosystem.items, ...ecosystem.items];
  return (
    <section className="border-y border-border/50 bg-card/30 py-12" aria-labelledby="ecosystem-title">