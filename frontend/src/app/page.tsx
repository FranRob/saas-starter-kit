import Link from "next/link";
import {
  Users,
  ShieldCheck,
  KeyRound,
  LayoutDashboard,
  Database,
  Boxes,
  Github,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Users,
    title: "Multi-tenant",
    description:
      "Full data isolation per organization. Every tenant lives in its own space with scoped queries.",
  },
  {
    icon: ShieldCheck,
    title: "JWT Auth",
    description:
      "Stateless authentication with access and refresh tokens. Secure, scalable, and easy to extend.",
  },
  {
    icon: KeyRound,
    title: "Two-Factor Auth",
    description:
      "TOTP-based 2FA out of the box. Users can enable it per account via QR code.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Pre-built admin dashboard with stats overview, data tables, and responsive sidebar.",
  },
  {
    icon: Database,
    title: "CRUD Modules",
    description:
      "Contacts and Products modules with search, pagination, and modal forms — ready to customize.",
  },
  {
    icon: Boxes,
    title: "REST API",
    description:
      "Express 5 backend with modular architecture. Add new resources in minutes.",
  },
];

const stack = [
  "Next.js 14",
  "Express 5",
  "PostgreSQL",
  "Redis",
  "Prisma",
  "Docker",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-400" aria-hidden="true" />
            <span className="text-sm font-semibold tracking-tight">
              SaaS Starter Kit
            </span>
          </div>
          <nav className="flex items-center gap-3" aria-label="Main navigation">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-14">
        {/* Background gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center animate-fade-in">
          <Badge variant="secondary" className="mb-6 border border-violet-500/30 bg-violet-500/10 text-violet-300">
            Open Source
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            The SaaS{" "}
            <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              Starter Kit
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
            Multi-tenant. Auth ready. Ship faster.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/register">
                Try Demo
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on GitHub (opens in new tab)"
              >
                <Github className="mr-2 h-4 w-4" aria-hidden="true" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-6xl px-6 py-24"
      >
        <div className="mb-16 text-center">
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Everything you need to ship
          </h2>
          <p className="mt-4 text-muted-foreground">
            Production-ready modules. No boilerplate. Just build.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors duration-200 hover:border-violet-500/50 hover:bg-violet-500/5"
              >
                <div className="mb-4 inline-flex rounded-lg bg-violet-500/10 p-2.5">
                  <Icon
                    className="h-5 w-5 text-violet-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-2 font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stack */}
      <section
        aria-labelledby="stack-heading"
        className="border-y border-border bg-card/30 py-16"
      >
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2
            id="stack-heading"
            className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Built with
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {stack.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="border-border px-4 py-2 text-sm font-medium text-foreground"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        aria-labelledby="cta-heading"
        className="relative mx-auto max-w-6xl px-6 py-32 text-center"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-3xl" />
        </div>
        <div className="relative">
          <h2
            id="cta-heading"
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Start building today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Clone, configure, deploy. Your SaaS in hours, not weeks.
          </p>
          <div className="mt-10">
            <Button size="lg" asChild>
              <Link href="/register">
                Create your account
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>
          SaaS Starter Kit — Open source. MIT License.
        </p>
      </footer>
    </div>
  );
}
