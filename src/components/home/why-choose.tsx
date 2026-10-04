import Link from "@/components/ui/link";
import { ArrowRight, Bot, Headphones, Layers } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { techStack } from "@/content/site";
import { toBanglaDigits } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";

const icons = [Layers, Bot, Headphones];
const hrefs = ["/get-started", "/solutions/ai-agents", "/contact"];

export async function WhyChoose() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  return (
    <section className="section" aria-labelledby="why-title">
      <Container>
        <SectionHeader
          eyebrow={d.why.eyebrow}
          title={
            <span id="why-title">
              {d.why.titleA}