/**
 * /__ds — catálogo vivo do design system. Só existe em DEV ou com VITE_DS_CATALOG=true.
 * Tudo aqui usa os mesmos tokens e componentes do produto; se algo parece errado aqui, está errado no app.
 */
import { useState, type ReactNode } from "react";
import { AlertTriangle, Bell, ChevronRight, FileText, Moon, Plus, Search, Sun, Wallet } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, HashAddress, Money, PageHeader, Rate, Section, Stat, StatusBadge } from "@/components/product";
import { useTheme } from "@/components/theme-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_REGISTRY, type StatusEntity, type StatusEntry, type StatusTone, type StatusValue } from "@/domain/status/status.registry";
import { cn } from "@/lib/utils";

import { RAMPS, STEPS } from "./ramps";

const NAV = [
  ["cores", "Cores"],
  ["tipografia", "Tipografia"],
  ["espaco", "Espaço e forma"],
  ["acoes", "Ações"],
  ["status", "Status"],
  ["dados", "Dados"],
  ["estrutura", "Estrutura"],
  ["formulario", "Formulário"],
  ["feedback", "Feedback"],
  ["marca", "Marca"],
] as const;

function Spec({ id, title, intro, children }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-5 border-b py-10 last:border-0">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {intro ? <p className="max-w-prose text-sm text-muted-foreground">{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Example({ title, code, children, className }: { title?: string; code?: string; children: ReactNode; className?: string }) {
  return (
    <div className="space-y-2">
      {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
      <div className={cn("rounded-lg border bg-card p-5", className)}>{children}</div>
      {code ? <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">{code}</pre> : null}
    </div>
  );
}

function Swatch({ className, name, note }: { className: string; name: string; note?: string }) {
  return (
    <div className="space-y-1.5">
      <div className={cn("h-12 rounded-md border", className)} />
      <div className="text-xs font-medium">{name}</div>
      {note ? <div className="text-2xs text-muted-foreground">{note}</div> : null}
    </div>
  );
}

const TONES: StatusTone[] = ["success", "warning", "destructive", "info", "neutral", "ai"];

type SampleRow = { id: string; stage: StatusValue<"receivableStage">; captado: number; alvo: number; taxa: number; ticket: number };
const SAMPLE_ROWS: SampleRow[] = [
  { id: "offer-demo-001", stage: "funding", captado: 48000, alvo: 117000, taxa: 0.02, ticket: 1000 },
  { id: "offer-demo-002", stage: "funded", captado: 44000, alvo: 44000, taxa: 0.017, ticket: 500 },
  { id: "offer-demo-003", stage: "overdue", captado: 8000, alvo: 58000, taxa: 0.025, ticket: 1000 },
  { id: "offer-demo-004", stage: "payer_settled", captado: 196000, alvo: 196000, taxa: 0.018, ticket: 2000 },
];

export function DesignSystemPage() {
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  const [progress] = useState(62);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/90 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <img src="/brand/dupply-mark.svg" alt="" className="h-6" />
          <span className="text-sm font-semibold">Design system</span>
          <Badge variant="secondary">v0.1</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => setTheme(dark ? "light" : "dark")}>
          {dark ? <Sun /> : <Moon />}
          {dark ? "Claro" : "Escuro"}
        </Button>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 md:grid-cols-[180px_1fr]">
        <nav className="sticky top-20 hidden self-start py-10 md:block">
          <ul className="space-y-1 text-sm">
            {NAV.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0">
          <div className="pt-10">
            <h1 className="text-3xl font-semibold tracking-tight">Componentes e tokens da Dupply</h1>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              Catálogo vivo: o que está aqui é o que o app usa. Regra de cor: azul é ação, verde/âmbar/coral são status, violeta é IA, ciano e menta são
              marca. Documentação em <code className="font-mono">DESIGN.md</code>.
            </p>
          </div>

          {/* ---------------- CORES ---------------- */}
          <Spec id="cores" title="Cores" intro="Semânticos primeiro; ramps só quando o semântico não existe (badges de status usam ramp-100/700).">
            <Example title="Semânticos">
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                <Swatch className="bg-primary" name="primary" note="ação" />
                <Swatch className="bg-success" name="success" />
                <Swatch className="bg-warning" name="warning" />
                <Swatch className="bg-destructive" name="destructive" />
                <Swatch className="bg-info" name="info" />
                <Swatch className="bg-ai" name="ai" note="só IA" />
                <Swatch className="bg-background" name="background" />
                <Swatch className="bg-card" name="card" />
                <Swatch className="bg-muted" name="muted" />
                <Swatch className="bg-accent" name="accent" note="hover" />
                <Swatch className="bg-border" name="border" />
                <Swatch className="bg-navy" name="navy" note="páginas públicas" />
              </div>
            </Example>
            <Example title="Marca" code="style={{ background: 'var(--gradient-brand)' }}  // uma vez por tela, nunca em botão ou status">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Swatch className="bg-brand-blue" name="brand-blue" note="#0192FE" />
                <Swatch className="bg-brand-blue-deep" name="brand-blue-deep" note="#064DCD" />
                <Swatch className="bg-brand-cyan" name="brand-cyan" note="#0FCBF4" />
                <Swatch className="bg-brand-mint" name="brand-mint" note="#52EDBA" />
                <div className="col-span-2 h-12 rounded-md" style={{ background: "var(--gradient-brand)" }} />
                <div className="col-span-2 h-12 rounded-md" style={{ background: "var(--gradient-brand-accent)" }} />
              </div>
            </Example>
            <Example title="Ramps">
              <div className="space-y-2">
                {Object.entries(RAMPS).map(([fam, classes]) => (
                  <div key={fam} className="grid grid-cols-[72px_repeat(11,1fr)] items-center gap-1">
                    <span className="text-xs font-medium">{fam}</span>
                    {classes.map((c, i) => (
                      <div key={c} className={cn("h-7 rounded-sm", c)} title={`${fam}-${STEPS[i]}`} />
                    ))}
                  </div>
                ))}
              </div>
            </Example>
          </Spec>

          {/* ---------------- TIPOGRAFIA ---------------- */}
          <Spec id="tipografia" title="Tipografia" intro="Só Inter. Pesos 400 corpo, 500 rótulo, 600 título, 700 KPI. Números com a utility `numeric`.">
            <Example>
              <div className="space-y-4">
                {[
                  ["text-3xl font-semibold tracking-tight", "text-3xl 600", "Antecipe duplicatas em horas"],
                  ["text-2xl font-semibold tracking-tight", "text-2xl 600 · título de página", "Oportunidades"],
                  ["text-xl font-semibold", "text-xl 600", "Resumo da oferta"],
                  ["text-base font-semibold", "text-base 600 · título de seção", "Duplicatas recentes"],
                  ["text-sm", "text-sm 400 · corpo", "A Dupply transforma duplicatas aprovadas em ofertas de investimento."],
                  ["text-xs font-medium text-muted-foreground", "text-xs 500 · rótulo", "Taxa mensal"],
                  ["text-2xs text-muted-foreground", "text-2xs · meta", "Atualizado há 2 min"],
                ].map(([cls, label, text]) => (
                  <div key={label} className="grid grid-cols-[180px_1fr] items-baseline gap-4">
                    <span className="font-mono text-2xs text-muted-foreground">{label}</span>
                    <span className={cls}>{text}</span>
                  </div>
                ))}
              </div>
            </Example>
            <div className="grid gap-4 sm:grid-cols-2">
              <Example title="numeric (tabular)" code='<td className="numeric">R$ 184.250,00</td>'>
                <table className="numeric w-full text-sm">
                  <tbody>
                    {[
                      ["Captado", "R$ 184.250,00"],
                      ["Alvo", "R$ 250.000,00"],
                      ["Ticket mínimo", "R$ 1.000,00"],
                      ["Taxa", "1,90% a.m."],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td className="py-0.5 text-muted-foreground">{k}</td>
                        <td className="py-0.5 text-right">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Example>
              <Example title="font-mono (hash, ID)">
                <div className="space-y-1 font-mono text-xs">
                  <div>DUP-2026-0141</div>
                  <div>GDRXE2BQUC3AZNPVFSCEZ76NJ3WWW2JC7HUQAXFZ…K7QA</div>
                  <div>0x7f3a9c2e…4b1d</div>
                </div>
              </Example>
            </div>
          </Spec>

          {/* ---------------- ESPAÇO ---------------- */}
          <Spec id="espaco" title="Espaço e forma" intro="Base 4 px. Card p-6, grid gap-4, seção space-y-6. Radius pelo tema; pílula só em badge.">
            <Example>
              <div className="flex flex-wrap items-end gap-6">
                {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
                  <div key={n} className="space-y-1 text-center">
                    <div className="bg-primary/20 ring-1 ring-primary/40" style={{ width: n * 4, height: n * 4 }} />
                    <div className="font-mono text-2xs text-muted-foreground">{n}</div>
                  </div>
                ))}
                <div className="ml-auto flex items-end gap-4">
                  {[
                    ["rounded-sm", "sm"],
                    ["rounded-md", "md · input, botão"],
                    ["rounded-lg", "lg · card"],
                    ["rounded-xl", "xl"],
                    ["rounded-full", "full · badge, avatar"],
                  ].map(([c, l]) => (
                    <div key={c} className="space-y-1 text-center">
                      <div className={cn("size-10 border bg-muted", c)} />
                      <div className="font-mono text-2xs text-muted-foreground">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Example>
          </Spec>

          {/* ---------------- AÇÕES ---------------- */}
          <Spec id="acoes" title="Ações" intro="Um botão primário por área. Secundário é outline; ghost para ações de baixo peso; destructive só para irreversível.">
            <Example code='<Button>Investir</Button> <Button variant="outline">Ver detalhes</Button> <Button variant="ghost">Cancelar</Button>'>
              <div className="flex flex-wrap items-center gap-3">
                <Button>
                  <Plus />
                  Nova duplicata
                </Button>
                <Button variant="outline">Ver detalhes</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="ghost">Cancelar</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Recusar</Button>
                <Button disabled>
                  <Spinner />
                  Enviando
                </Button>
              </div>
            </Example>
            <Example title="Tamanhos">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">xs</Button>
                <Button size="sm">sm</Button>
                <Button>default</Button>
                <Button size="lg">lg</Button>
                <Button size="icon-xs" variant="outline" aria-label="Notificações">
                  <Bell />
                </Button>
                <Button size="icon-sm" variant="outline" aria-label="Notificações">
                  <Bell />
                </Button>
                <Button size="icon" variant="outline" aria-label="Notificações">
                  <Bell />
                </Button>
              </div>
            </Example>
          </Spec>

          {/* ---------------- STATUS ---------------- */}
          <Spec id="status" title="Status" intro="Rótulo e cor vêm do registro em domain/status. Nunca <Badge className='bg-…'>. Inventário completo na spec da feature.">
            <Example title="Tons" code='<StatusBadge tone="ai" dot>Laudo IA</StatusBadge>'>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <StatusBadge key={t} tone={t} dot>
                    {t}
                  </StatusBadge>
                ))}
                <StatusBadge tone="info" size="sm">
                  size sm
                </StatusBadge>
              </div>
            </Example>
            <Example title="Por entidade" code='<StatusBadge entity="receivableStage" value="funding" />'>
              <div className="space-y-3">
                {(Object.keys(STATUS_REGISTRY) as StatusEntity[]).map((entity) => (
                  <div key={entity} className="grid grid-cols-[170px_1fr] items-start gap-3">
                    <span className="pt-0.5 font-mono text-xs text-muted-foreground">{entity}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.entries(STATUS_REGISTRY[entity]) as Array<[string, StatusEntry]>).map(([value, entry]) => (
                        <StatusBadge key={value} tone={entry.tone}>
                          {entry.label}
                        </StatusBadge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Example>
          </Spec>

          {/* ---------------- DADOS ---------------- */}
          <Spec id="dados" title="Dados" intro="Dinheiro, taxa, KPI e identificadores. Sempre tabulares.">
            <div className="grid gap-4 lg:grid-cols-2">
              <Example title="Money" code='<Money value={184250} size="lg" />  <Money value={-1200} signed />  <Money value={1250000} compact />'>
                <div className="flex flex-wrap items-end gap-6">
                  <Money value={184250} />
                  <Money value={184250} size="md" />
                  <Money value={184250} size="lg" />
                  <Money value={184250} size="xl" />
                  <Money value={3200} signed />
                  <Money value={-1200} signed />
                  <Money value={1250000} compact size="md" />
                  <Money value={184250} tone="muted" noCents />
                </div>
              </Example>
              <Example title="Rate" code='<Rate value={0.019} unit="am" />  <Rate value={12.4} signed />'>
                <div className="flex flex-wrap items-end gap-6">
                  <Rate value={0.019} unit="am" />
                  <Rate value={0.019} unit="am" size="md" />
                  <Rate value={0.254} unit="aa" size="lg" />
                  <Rate value={12.4} signed />
                  <Rate value={-3.1} signed />
                  <Rate value={62} decimals={0} />
                </div>
              </Example>
            </div>
            <Example title="Stat" code='<Stat label="Captado" value={<Money value={184250} size="lg" />} delta={12.4} hint="esta semana" icon={<Wallet />} />'>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Captado" value={<Money value={184250} size="lg" />} delta={12.4} hint="esta semana" icon={<Wallet />} />
                <Stat label="Taxa mensal" value={<Rate value={0.019} unit="am" size="lg" />} hint="Vence em 42 dias" />
                <Stat label="Duplicatas em análise" value={<span className="numeric text-2xl font-semibold">7</span>} delta={-3.1} hint="vs. ontem" icon={<FileText />} />
                <Stat label="Inadimplência" value={<Rate value={0.8} size="lg" />} hint="últimos 30 dias" icon={<AlertTriangle />} />
              </div>
            </Example>
            <div className="grid gap-4 lg:grid-cols-2">
              <Example title="HashAddress" code='<HashAddress value={hash} href={explorerUrl} />'>
                <div className="space-y-2">
                  <HashAddress value="GDRXE2BQUC3AZNPVFSCEZ76NJ3WWW2JC7HUQAXFZK7QAXFZK7QA" href="https://stellar.expert" />
                  <HashAddress value="0x7f3a9c2e8b1d4f6a9c2e8b1d4f6a9c2e8b1d4b1d" chars={4} />
                  <HashAddress value="DUP-2026-0141" full copy={false} />
                </div>
              </Example>
              <Example title="Progress">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Captado</span>
                    <span className="numeric">
                      <Money value={155000} /> de <Money value={250000} />
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>
              </Example>
            </div>
            <Example title="Tabela" code="<Table> com <Money>, <Rate> e <StatusBadge> nas células; números alinhados à direita">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Oferta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Captado / alvo</TableHead>
                    <TableHead className="text-right">Taxa</TableHead>
                    <TableHead className="text-right">Ticket mín.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SAMPLE_ROWS.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell>
                        <StatusBadge entity="receivableStage" value={r.stage} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Money value={r.captado} /> <span className="text-muted-foreground">/</span> <Money value={r.alvo} tone="muted" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Rate value={r.taxa} unit="am" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Money value={r.ticket} noCents />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Example>
          </Spec>

          {/* ---------------- ESTRUTURA ---------------- */}
          <Spec id="estrutura" title="Estrutura" intro="PageHeader no topo de toda página; Section para blocos; EmptyState sempre com próximo passo.">
            <Example title="PageHeader" code='<PageHeader backTo="/seller/duplicatas" title="DUP-2026-0141" meta={<StatusBadge … />} description="…" actions={<Button>Aceitar proposta</Button>} />'>
              <PageHeader
                backTo="#estrutura"
                backLabel="Voltar para duplicatas"
                title="DUP-2026-0141"
                meta={
                  <>
                    <StatusBadge entity="duplicataAnaliseFeminine" value="aprovado" />
                    <StatusBadge entity="duplicataAceite" value="pendente" />
                  </>
                }
                description="Supermercados XYZ Ltda · vence em 15/07/2026 · mercantil"
                actions={
                  <>
                    <Button variant="outline">Recusar</Button>
                    <Button>Aceitar proposta</Button>
                  </>
                }
                className="mb-0"
              />
            </Example>
            <Example title="Section + Card" code='<Section title="Duplicatas recentes" actions={…}>…</Section>'>
              <Section
                title="Duplicatas recentes"
                description="Últimos 30 dias"
                actions={
                  <Button variant="outline" size="sm">
                    Ver todas
                    <ChevronRight />
                  </Button>
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumo da oferta</CardTitle>
                      <CardDescription>Oportunidade auditada pelo agente de IA</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rentabilidade</span>
                        <Rate value={0.02} unit="am" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Alvo</span>
                        <Money value={117000} />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="gap-3">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Análise do agente de IA <StatusBadge tone="ai">IA</StatusBadge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Sacado com aceite confirmado e histórico de pontualidade. Conteúdo gerado por IA leva o tom violeta, sempre.
                    </CardContent>
                  </Card>
                </div>
              </Section>
            </Example>
            <div className="grid gap-4 lg:grid-cols-2">
              <Example title="EmptyState" code='<EmptyState icon={<FileText />} title="…" description="…" action={<Button>…</Button>} />'>
                <EmptyState
                  icon={<FileText />}
                  title="Nenhuma duplicata ainda"
                  description="Envie a primeira para iniciar a análise de risco. Leva menos de cinco minutos."
                  action={
                    <Button>
                      <Plus />
                      Enviar duplicata
                    </Button>
                  }
                />
              </Example>
              <Example title="Tabs + Skeleton">
                <Tabs defaultValue="visao">
                  <TabsList>
                    <TabsTrigger value="visao">Visão</TabsTrigger>
                    <TabsTrigger value="swot">SWOT</TabsTrigger>
                    <TabsTrigger value="dre">DRE</TabsTrigger>
                  </TabsList>
                  <TabsContent value="visao" className="space-y-2 pt-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </TabsContent>
                </Tabs>
              </Example>
            </div>
          </Spec>

          {/* ---------------- FORMULÁRIO ---------------- */}
          <Spec id="formulario" title="Formulário" intro="Rótulo em cima, ajuda embaixo, erro em coral com a mensagem do schema Zod. Um primário por formulário.">
            <Example>
              <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label htmlFor="ds-valor">Valor da duplicata</Label>
                  <Input id="ds-valor" inputMode="decimal" placeholder="R$ 0,00" className="numeric" />
                  <p className="text-xs text-muted-foreground">Valor de face da nota fiscal.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ds-venc">Vencimento</Label>
                  <Input id="ds-venc" type="date" aria-invalid className="numeric" />
                  <p className="text-xs text-coral-700 dark:text-coral-400">Informe uma data futura.</p>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select defaultValue="mercantil">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mercantil">Mercantil</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ds-busca">Buscar</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="ds-busca" placeholder="Sacado, número da nota…" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Comprovante</Label>
                  <RadioGroup defaultValue="entrega" className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="ds-r1" value="entrega" />
                      <Label htmlFor="ds-r1">Entrega</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="ds-r2" value="aceite" />
                      <Label htmlFor="ds-r2">Aceite</Label>
                    </div>
                  </RadioGroup>
                  <div className="flex items-center gap-2">
                    <Checkbox id="ds-c1" defaultChecked />
                    <Label htmlFor="ds-c1">Li e aceito os termos de cessão</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="ds-s1" />
                    <Label htmlFor="ds-s1">Receber aviso por e-mail</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ds-obs">Observações</Label>
                  <Textarea id="ds-obs" placeholder="Opcional" rows={3} />
                </div>
                <div className="flex justify-end gap-2 sm:col-span-2">
                  <Button variant="ghost" type="button">
                    Cancelar
                  </Button>
                  <Button type="submit">Enviar duplicata</Button>
                </div>
              </form>
            </Example>
          </Spec>

          {/* ---------------- FEEDBACK ---------------- */}
          <Spec id="feedback" title="Feedback" intro="Alert para contexto na página; toast para confirmação de ação; dialog para decisão irreversível.">
            <div className="grid gap-4 lg:grid-cols-2">
              <Example title="Alert">
                <div className="space-y-3">
                  <Alert>
                    <Bell />
                    <AlertTitle>Captação aberta</AlertTitle>
                    <AlertDescription>A oferta recebe aportes até 27/10/2026 ou até atingir o alvo.</AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <AlertTriangle />
                    <AlertTitle>Documento recusado</AlertTitle>
                    <AlertDescription>O comprovante de entrega está ilegível. Envie um novo arquivo em PDF ou JPG.</AlertDescription>
                  </Alert>
                </div>
              </Example>
              <Example title="Toast e Dialog">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => toast.success("Duplicata enviada", { description: "Análise começa em instantes." })}>
                    Toast de sucesso
                  </Button>
                  <Button variant="outline" onClick={() => toast.error("Não foi possível salvar", { description: "Tente novamente." })}>
                    Toast de erro
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Recusar proposta</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Recusar a proposta de antecipação?</DialogTitle>
                        <DialogDescription>A duplicata volta para a fila e o deságio proposto deixa de valer. Você pode enviar de novo depois.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="ghost">Voltar</Button>
                        <Button variant="destructive">Recusar proposta</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </Example>
            </div>
          </Spec>

          {/* ---------------- MARCA ---------------- */}
          <Spec id="marca" title="Marca" intro="Arquivos em public/brand. Símbolo sozinho só onde o nome já é conhecido. Regras completas no manual de marca.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Example className="flex items-center justify-center bg-white py-10">
                <img src="/brand/dupply-logo.svg" alt="Dupply" className="h-10" />
              </Example>
              <Example className="flex items-center justify-center bg-navy py-10">
                <img src="/brand/dupply-logo-on-dark.svg" alt="Dupply" className="h-10" />
              </Example>
              <Example className="flex items-center justify-center gap-8 py-8">
                <img src="/brand/dupply-mark.svg" alt="" className="h-10" />
                <img src="/brand/dupply-mark-mono-navy.svg" alt="" className="h-10 dark:hidden" />
                <img src="/brand/dupply-mark-mono-white.svg" alt="" className="hidden h-10 dark:block" />
                <img src="/brand/favicon-32.png" alt="" className="size-8" />
              </Example>
              <Example className="flex items-center justify-center py-8">
                <a href="/brand/dupply-brand-book.pdf" target="_blank" rel="noreferrer" className="text-sm text-primary underline-offset-4 hover:underline">
                  Abrir o manual de marca (PDF)
                </a>
              </Example>
            </div>
          </Spec>
        </main>
      </div>
    </div>
  );
}

export default DesignSystemPage;
