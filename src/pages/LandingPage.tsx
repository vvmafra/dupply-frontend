import { Link } from "react-router-dom";
import {
  ArrowRight,
  Box,
  Brain,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Globe,
  Network,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PublicShell } from "@/components/layout/PublicShell";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const BRAND = {
  navy: "#0B1F3B",
  blue: "#2F6BFF",
  mint: "#35E6A8",
  text: "#F4F7FB",
  muted: "#7C8594",
} as const;

const HERO_PILLS = [
  { icon: Box, label: "Infraestrutura auditável ponta a ponta" },
  { icon: Brain, label: "Análise de risco especializada" },
  { icon: Globe, label: "Liquidez instantânea com trilha verificável" },
  { icon: Shield, label: "Transparente e sem intermediários" },
] as const;

const WHY_DUPPLY = [
  "Acesse capital instantaneamente com faturas registradas e auditáveis na plataforma.",
  "Custos mais baixos com provedores de liquidez.",
  "Decisões baseadas análise de crédito justo e rápido.",
  "Trilha completa de eventos e documentos para transparência e conformidade.",
] as const;

const PRODUCT_FEATURES = [
  {
    title: "Registro digital de recebíveis",
    description: "Converta faturas em ativos digitais com histórico verificável.",
  },
  {
    title: "Pontuação de score de crédito",
    description: "Análise de risco mais ágil e eficiente.",
  },
  {
    title: "Liquidação instantânea",
    description: "Receba fundos em minutos, em qualquer lugar do Brasil.",
  },
] as const;

const STEPS = [
  {
    title: "Cadastro do cedente",
    description:
      "Cadastro na plataforma com documentação em anexo para análise de risco.",
  },
  {
    title: "Envio da duplicata",
    description: "Envio da duplicata e verificação conduzida por analista de risco.",
  },
  {
    title: "Notificação ao sacado",
    description: "Aviso de aprovação ao sacado, referente à duplicata.",
  },
  {
    title: "Pagamento ao cedente",
    description: "Pagamento ao cedente referente ao ativo.",
  },
] as const;

function LandingSectionDivider() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="landing-fiber-divider" aria-hidden />
    </div>
  );
}

const DASHBOARD_ROWS = [
  {
    invoice: "NF-2024-0891",
    buyer: "TechBrasil Ltda.",
    value: "R$ 84.200",
    due: "12/06/2026",
    status: "Financiado",
    statusTone: "mint" as const,
    progress: 100,
  },
  {
    invoice: "NF-2024-0902",
    buyer: "Logística Sul S.A.",
    value: "R$ 210.000",
    due: "28/06/2026",
    status: "Em financiamento",
    statusTone: "blue" as const,
    progress: 62,
  },
  {
    invoice: "NF-2024-0910",
    buyer: "Agro Norte",
    value: "R$ 45.600",
    due: "05/07/2026",
    status: "Aberto",
    statusTone: "muted" as const,
    progress: 0,
  },
];

function StatusBadge({
  label,
  tone,
}: Readonly<{
  label: string;
  tone: "mint" | "blue" | "muted";
}>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        tone === "mint" && "bg-[#35E6A8]/20 text-[#35E6A8]",
        tone === "blue" && "bg-[#2F6BFF]/25 text-[#7CB4FF]",
        tone === "muted" && "bg-white/10 text-[#7C8594]",
      )}
    >
      {label}
    </span>
  );
}

function HeroInvoiceVisual() {
  return (
    <div className="relative mx-auto aspect-square max-w-md xl:max-w-none">
      <div
        className="absolute inset-8 rounded-full opacity-40 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${BRAND.blue}55 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-30 blur-2xl"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${BRAND.mint}44 0%, transparent 55%)`,
        }}
      />
      <div className="relative flex h-full min-h-[280px] items-center justify-center xl:min-h-[360px]">
        <div className="absolute inset-x-[12%] bottom-[8%] h-[18%] rounded-[100%] bg-black/40 blur-xl" />
        <div className="relative flex w-[72%] max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/15 bg-gradient-to-b from-white/12 to-white/[0.04] p-6 shadow-[0_0_60px_rgba(47,107,255,0.25)] backdrop-blur-sm">
          <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#35E6A8] shadow-lg">
            <FileText className="size-7 text-white" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-white">Recebível registrado</p>
            <p className="text-lg font-bold text-white">Fatura digital</p>
            <p className="text-sm text-[#35E6A8]">Auditável · Rastreável</p>
          </div>
          <div className="flex w-full justify-center gap-3 pt-1">
            <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <CircleDollarSign className="size-5 text-[#35E6A8]" />
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <Network className="size-5 text-[#35E6A8]" />
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <Shield className="size-5 text-[#35E6A8]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LaptopMock() {
  return (
    <div className="relative rounded-xl border border-white/10 bg-gradient-to-b from-[#0f2748] to-[#0B1F3B] p-2 shadow-2xl shadow-black/50">
      <div className="mb-1 flex items-center gap-1.5 px-2 py-1">
        <span className="size-2 rounded-full bg-red-500/80" />
        <span className="size-2 rounded-full bg-amber-500/80" />
        <span className="size-2 rounded-full bg-emerald-500/80" />
      </div>
      <div className="rounded-lg border border-white/5 bg-[#08162c] p-4">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-[#7C8594]">Painel Dupply</p>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { k: "Recebíveis registrados", v: "R$ 2.450.000" },
            { k: "Valor financiado", v: "R$ 1.820.000" },
            { k: "Provedores ativos", v: "128" },
            { k: "Tempo médio", v: "2m 34s" },
          ].map((s) => (
            <div key={s.k} className="rounded-md border border-white/5 bg-white/[0.03] p-2">
              <p className="text-[9px] text-[#7C8594]">{s.k}</p>
              <p className="text-xs font-semibold text-white">{s.v}</p>
            </div>
          ))}
        </div>
        <p className="mb-2 text-[10px] font-semibold text-[#F4F7FB]">Recebíveis recentes</p>
        <div className="overflow-x-auto rounded-md border border-white/5">
          <table className="w-full min-w-[420px] text-left text-[10px]">
            <thead className="border-b border-white/10 bg-white/[0.04] text-[#7C8594]">
              <tr>
                <th className="px-2 py-1.5 font-medium">Fatura</th>
                <th className="px-2 py-1.5 font-medium">Comprador</th>
                <th className="px-2 py-1.5 font-medium">Valor</th>
                <th className="px-2 py-1.5 font-medium">Vencimento</th>
                <th className="px-2 py-1.5 font-medium">Status</th>
                <th className="px-2 py-1.5 font-medium">Progresso</th>
              </tr>
            </thead>
            <tbody className="text-[#F4F7FB]">
              {DASHBOARD_ROWS.map((row) => (
                <tr key={row.invoice} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-2 py-1.5 font-mono text-[#7CB4FF]">{row.invoice}</td>
                  <td className="px-2 py-1.5 text-[#7C8594]">{row.buyer}</td>
                  <td className="px-2 py-1.5">{row.value}</td>
                  <td className="px-2 py-1.5 text-[#7C8594]">{row.due}</td>
                  <td className="px-2 py-1.5">
                    <StatusBadge label={row.status} tone={row.statusTone} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Progress
                      value={row.progress}
                      className="h-1.5 bg-white/10"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <PublicShell style={{ "--primary": BRAND.blue } as React.CSSProperties}>
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -right-32 -top-32 size-[480px] rounded-full opacity-30 blur-3xl"
            style={{ background: `radial-gradient(circle, ${BRAND.blue}, transparent 70%)` }}
          />
          <div className="container relative mx-auto px-4 py-14 md:py-20 lg:py-24">
            <div className="grid items-center gap-12 xl:grid-cols-12">
              <div className="space-y-8 xl:col-span-5">
                <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-[2.75rem] xl:text-5xl">
                  Liquidez{" "}
                  <span className="bg-gradient-to-r from-[#7CB4FF] to-[#2F6BFF] bg-clip-text text-transparent">
                    instantânea
                  </span>{" "}
                  para empresas modernas.
                </h1>
                <p className="max-w-xl text-balance text-lg leading-relaxed text-[#7C8594]">
                  A Dupply transforma recebíveis em capital de giro imediato usando análise de risco e
                  uma infraestrutura com trilha auditável em cada etapa. 
                  Garantindo maior liquidez, menor custo, maior transparência e segurança.
                </p>
                <div className="flex flex-wrap gap-2">
                  {HERO_PILLS.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#F4F7FB]"
                    >
                      <Icon className="size-3.5 shrink-0 text-[#35E6A8]" aria-hidden />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    asChild
                    className="border-0 bg-[#2F6BFF] text-white shadow-[0_0_24px_rgba(47,107,255,0.4)] hover:bg-[#2F6BFF]/90"
                  >
                    <Link to={ROUTES.login}>
                      Começar agora
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                  >
                    <Link to={ROUTES.selectProfile}>Explorar protótipo</Link>
                  </Button>
                </div>
              </div>

              <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm xl:col-span-3">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#35E6A8]">
                  <Sparkles className="size-4" />
                  Por que Dupply?
                </h2>
                <ul className="space-y-3 text-sm leading-relaxed text-[#7C8594]">
                  {WHY_DUPPLY.map((item) => (
                    <li key={item} className="flex gap-2">
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-[#2F6BFF]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl border border-[#2F6BFF]/30 bg-gradient-to-br from-[#2F6BFF]/15 to-[#35E6A8]/10 p-4 text-sm font-medium leading-snug text-[#F4F7FB]">
                  O futuro das finanças é a Dupply
                </div>
              </aside>

              <div className="xl:col-span-4">
                <HeroInvoiceVisual />
              </div>
            </div>
          </div>
        </section>

        <LandingSectionDivider />

        {/* Produto + mockups */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
              <div className="space-y-4 lg:col-span-4">
                <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Infraestrutura transparente</h2>
                <p className="text-balance leading-relaxed text-[#7C8594]">
                  A Dupply é a infraestrutura que conecta empresas com recebíveis a funding próprio, transparente e com trilha auditável.
                </p>
              </div>
              <div className="flex flex-col items-center gap-6 lg:col-span-5 lg:flex-row lg:items-start lg:justify-center lg:gap-4">
                <div className="w-full max-w-xl shrink lg:flex-1">
                  <LaptopMock />
                </div>
              </div>
              <div className="space-y-4 lg:col-span-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#35E6A8]">Principais recursos</h3>
                <ul className="space-y-4">
                  {PRODUCT_FEATURES.map((f) => (
                    <li key={f.title} className="border-l-2 border-[#2F6BFF] pl-4">
                      <p className="font-semibold text-white">{f.title}</p>
                      <p className="text-sm text-[#7C8594]">{f.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <LandingSectionDivider />

        {/* Arquitetura + como funciona */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-14 lg:grid-cols-2">
              <div>
                <h2 className="mb-8 text-2xl font-bold text-white">Arquitetura auditável</h2>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-2">
                  {[
                    { label: "Empresa (cedente)", icon: Wallet },
                    { label: "Registro do recebível (regras automatizadas)", icon: FileText },
                    { label: "Funding próprio", icon: Globe },
                  ].map(({ label, icon: Icon }, i, arr) => (
                    <div key={label} className="contents">
                      <Card className="border-white/10 bg-white/[0.04] text-center shadow-none sm:min-w-0 sm:flex-1">
                        <CardContent className="flex flex-col items-center gap-2 p-4">
                          <Icon className="size-6 text-[#2F6BFF]" />
                          <p className="text-xs font-medium leading-snug text-[#F4F7FB]">{label}</p>
                        </CardContent>
                      </Card>
                      {i < arr.length - 1 ? (
                        <ChevronRight
                          className="mx-auto hidden size-6 shrink-0 text-[#35E6A8] sm:mx-0 sm:block"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                  ))}
                </div>

              </div>

              <div>
                <h2 className="mb-8 text-2xl font-bold text-white">Como funciona</h2>
                <ol className="space-y-4">
                  {STEPS.map((step, idx) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-sm font-bold text-white">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{step.title}</p>
                        <p className="text-sm text-[#7C8594]">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <LandingSectionDivider />

        {/* CTA final */}
        <section className="py-16">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-2xl font-bold text-white">Pronto para começar?</h2>
            <p className="mt-2 text-[#7C8594]">
              Acesse o protótipo e explore as funcionalidades da plataforma em ambiente de demonstração.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 border-0 bg-[#2F6BFF] text-white hover:bg-[#2F6BFF]/90"
            >
              <Link to={ROUTES.login}>
                Acessar plataforma
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>


      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-sm font-medium text-[#F4F7FB]">
          Dupply. Transparente e auditável. Movido por confiança.
        </p>
        <p className="mt-3 text-xs text-[#7C8594]">
          © {new Date().getFullYear()} Dupply · Financiamento de recebíveis · Ambiente de demonstração
        </p>
      </footer>
    </PublicShell>
  );
}
