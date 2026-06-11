"use client";

import {
  Users,
  ShieldCheck,
  KeyRound,
  LayoutDashboard,
  BarChart3,
  Mail,
  Github,
  ArrowRight,
  Zap,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { LanguageSelector } from "@/components/language-selector";

const stack = [
  "Next.js",
  "Express",
  "PostgreSQL",
  "Redis",
  "Prisma",
  "Docker",
  "shadcn/ui",
];

export default function LandingPage() {
  const t = useTranslations("landing");

  const features = [
    {
      icon: Users,
      title: t("features.multiTenant"),
      description: t("features.multiTenantDesc"),
    },
    {
      icon: ShieldCheck,
      title: t("features.jwt"),
      description: t("features.jwtDesc"),
    },
    {
      icon: KeyRound,
      title: t("features.twoFa"),
      description: t("features.twoFaDesc"),
    },
    {
      icon: LayoutDashboard,
      title: t("features.team"),
      description: t("features.teamDesc"),
    },
    {
      icon: Mail,
      title: t("features.passwordReset"),
      description: t("features.passwordResetDesc"),
    },
    {
      icon: BarChart3,
      title: t("features.audit"),
      description: t("features.auditDesc"),
    },
  ];

  return (
    <div
      className="min-h-screen text-[#e0e0e0]"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      {/* Nav */}
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-white/5"
        style={{ backgroundColor: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-sky-400" aria-hidden="true" />
            <span className="font-mono text-sm font-semibold tracking-tight text-white">
              SaaS Starter Kit
            </span>
          </div>
          <nav className="flex items-center gap-3" aria-label="Main navigation">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="cursor-pointer text-[#e0e0e0] hover:text-white transition-colors duration-200"
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="cursor-pointer bg-orange-500 hover:bg-orange-400 text-white transition-colors duration-200"
            >
              <Link href="/register">{t("ctaDemo")}</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-14">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            className="h-[700px] w-[700px] rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: "#0EA5E9" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5">
            <span
              className="h-2 w-2 rounded-full bg-sky-400"
              aria-hidden="true"
            />
            <span className="font-mono text-xs font-medium text-sky-300">
              {t("badge")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-mono text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t("headline").split("\n")[0]}
            <br />
            <span style={{ color: "#0EA5E9" }}>{t("headline").split("\n")[1]}</span>
          </h1>

          <p className="mt-6 max-w-xl mx-auto text-lg leading-8 text-[#e0e0e0]/80">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              asChild
              className="w-full cursor-pointer sm:w-auto bg-orange-500 hover:bg-orange-400 text-white transition-colors duration-200"
            >
              <Link href="/register">
                {t("ctaDemo")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full cursor-pointer sm:w-auto border-white/20 text-[#e0e0e0] hover:border-white/40 hover:bg-white/5 transition-all duration-200"
            >
              <a
                href="https://github.com/FranRob/saas-starter-kit"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("ctaGitHub")} (opens in new tab)`}
              >
                <Github className="mr-2 h-4 w-4" aria-hidden="true" />
                {t("ctaGitHub")}
              </a>
            </Button>
          </div>

          {/* Demo credentials hint */}
          <p className="mt-5 text-xs text-[#e0e0e0]/50">
            {t("demoCredentials")}
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-6xl px-6 py-24"
      >
        <div className="mb-16 text-center">
          <h2
            id="features-heading"
            className="font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {t("features.title")}
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-white/8 p-6 transition-all duration-200 hover:border-sky-500/40"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="mb-4 inline-flex rounded-lg p-2.5"
                  style={{ backgroundColor: "rgba(14,165,233,0.12)" }}
                >
                  <Icon
                    className="h-5 w-5 text-sky-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-2 font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#e0e0e0]/60">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech stack */}
      <section
        aria-labelledby="stack-heading"
        className="border-y border-white/5 py-16"
        style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
      >
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2
            id="stack-heading"
            className="mb-8 font-mono text-xs font-semibold uppercase tracking-widest text-[#e0e0e0]/40"
          >
            {t("stack")}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 px-4 py-1.5 font-mono text-sm text-[#e0e0e0]/70"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section
        aria-labelledby="cta-heading"
        className="relative mx-auto max-w-6xl px-6 py-32"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            className="h-[400px] w-[400px] rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: "#F97316" }}
          />
        </div>

        <div
          className="relative mx-auto max-w-2xl rounded-2xl border border-white/10 p-10 text-center"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
            <Zap className="h-5 w-5 text-sky-400" aria-hidden="true" />
          </div>
          <h2
            id="cta-heading"
            className="font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {t("demo.title")}
          </h2>

          {/* Terminal-style credentials */}
          <div
            className="mt-8 rounded-lg border border-white/10 p-5 text-left font-mono text-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            aria-label={t("demo.credentials")}
          >
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
              <span className="h-3 w-3 rounded-full bg-red-500/70" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/70" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" aria-hidden="true" />
              <span className="ml-2 text-xs text-[#e0e0e0]/30">{t("demo.credentials")}</span>
            </div>
            <p className="text-[#e0e0e0]/50">
              <span className="text-sky-400">Email:</span>
              {"    "}
              <span className="text-[#e0e0e0]">demo@example.com</span>
            </p>
            <p className="mt-2 text-[#e0e0e0]/50">
              <span className="text-sky-400">Password:</span>
              {"  "}
              <span className="text-[#e0e0e0]">demo1234</span>
            </p>
          </div>

          <Button
            size="lg"
            asChild
            className="mt-8 cursor-pointer bg-orange-500 hover:bg-orange-400 text-white transition-colors duration-200"
          >
            <Link href="/login">
              {t("demo.cta")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#e0e0e0]/40">
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Data resets every hour
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-[#e0e0e0]/40">
        <p>
          {t("footer")}{" "}
          <a
            href="https://divmalcentrado.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-[#e0e0e0]/60 underline underline-offset-4 hover:text-[#e0e0e0] transition-colors duration-200"
          >
            divMalCentrado
          </a>
        </p>
      </footer>
    </div>
  );
}
