import {
  Award, BookOpen, Boxes, Bot, Briefcase, Building2, Calendar, Code, Cpu, FileText, GitBranch, GraduationCap, Handshake, Headphones,
  Layers, Lock, MessageSquare, Newspaper, SquarePen, Rocket, ShieldCheck, Sparkles, Target, Ticket, TrendingUp, Users, Zap, type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  award: Award,
  "book-open": BookOpen,
  boxes: Boxes,
  bot: Bot,
  briefcase: Briefcase,
  building: Building2,
  calendar: Calendar,
  code: Code,
  cpu: Cpu,
  "file-text": FileText,
  "git-branch": GitBranch,
  "graduation-cap": GraduationCap,
  handshake: Handshake,
  headphones: Headphones,
  layers: Layers,
  lock: Lock,
  "message-square": MessageSquare,
  newspaper: Newspaper,
  "pen-square": SquarePen,
  rocket: Rocket,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  target: Target,
  ticket: Ticket,
  "trending-up": TrendingUp,
  users: Users,
  zap: Zap,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = icons[name] ?? Sparkles;
  return <C className={className} aria-hidden="true" />;
}
