import { useState } from "react";
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  Sparkles,
  PieChart,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyBRL } from "@/lib/formatters";
import type { DuplicataAiReport } from "@/domain/duplicata/duplicata.types";

interface AnalystAiReportProps {
  report?: DuplicataAiReport | null;
  pdfUrl?: string | null;
}

export function AnalystAiReport({ report, pdfUrl }: AnalystAiReportProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "swot" | "financial">("overview");

  if (!report) {
    return (
      <Card className="border-dashed border-2 flex flex-col items-center justify-center p-12 text-center h-[400px]">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Sparkles className="size-8 text-slate-300 animate-pulse" />
        </div>
        <CardTitle className="text-lg font-medium mb-1 text-white">Análise de IA Pendente</CardTitle>
        <CardDescription className="max-w-xs text-slate-300">
          Esta duplicata ainda não possui uma avaliação automatizada do Agente de IA de Risco.
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card className="border border-indigo-100/20 dark:border-indigo-900/40 bg-slate-900/90 text-white shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500 text-white shadow-indigo-500/30 shadow-lg">
              <Sparkles className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-white">Análise do Agente de IA</CardTitle>
              <CardDescription className="text-xs text-slate-300 dark:text-slate-300">
                Dupply Risk Agent v1.2 • Verificado com Sucesso
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none text-white text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5">
              Concluído
            </Badge>
            {pdfUrl && (
              <Button 
                variant="outline" 
                size="xs" 
                className="h-7 text-xs gap-1 border-indigo-500/40 text-slate-200 hover:bg-indigo-950/60 dark:border-indigo-800"
                onClick={() => window.open(pdfUrl, "_blank")}
              >
                <Download className="size-3" />
                Relatório PDF
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-indigo-900/40 pb-px">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-all ${
              activeTab === "overview"
                ? "border-indigo-400 text-indigo-300"
                : "border-transparent text-slate-300 hover:text-white"
            }`}
          >
            <Building2 className="size-3.5" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("swot")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-all ${
              activeTab === "swot"
                ? "border-indigo-400 text-indigo-300"
                : "border-transparent text-slate-300 hover:text-white"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            Análise SWOT
          </button>
          <button
            onClick={() => setActiveTab("financial")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-all ${
              activeTab === "financial"
                ? "border-indigo-400 text-indigo-300"
                : "border-transparent text-slate-300 hover:text-white"
            }`}
          >
            <PieChart className="size-3.5" />
            Financeiro & Score
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "overview" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Descrição da Empresa
              </h4>
              <p className="text-xs text-slate-100 leading-relaxed text-justify">
                {report.companyDescription}
              </p>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-800/60 p-3 rounded-lg border border-indigo-900/30">
              <div>
                <span className="text-[10px] text-slate-300 block uppercase font-medium">
                  Fundação
                </span>
                <span className="text-xs font-semibold text-white">{report.foundationYear}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 block uppercase font-medium">
                  Estrutura Societária
                </span>
                <div className="space-y-0.5 mt-0.5">
                  {report.shareholders.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span className="truncate max-w-[120px] font-medium text-slate-200">{s.name}</span>
                      <span className="text-indigo-400 font-semibold">
                        {s.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customers & Suppliers Tabs inside Overview */}
            <Tabs defaultValue="customers" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8 bg-slate-800 border border-slate-700">
                <TabsTrigger value="customers" className="text-xs text-slate-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Portfólio de Clientes</TabsTrigger>
                <TabsTrigger value="suppliers" className="text-xs text-slate-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Fornecedores</TabsTrigger>
              </TabsList>
              <TabsContent value="customers" className="space-y-2 mt-2">
                {report.customerPortfolio.map((item, idx) => (
                  <div key={idx} className="space-y-1 bg-slate-800/80 p-2 rounded border border-slate-700">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium truncate max-w-[200px] text-slate-100" title={item.name}>
                        {item.name}
                      </span>
                      <span className="font-semibold text-indigo-400">{item.percentage}%</span>
                    </div>
                    {item.cnpj && (
                      <span className="text-[10px] text-slate-300 block font-mono">
                        CNPJ: {item.cnpj}
                      </span>
                    )}
                    <Progress value={item.percentage} className="h-1.5 bg-slate-700" />
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="suppliers" className="space-y-2 mt-2">
                {report.suppliers.map((item, idx) => (
                  <div key={idx} className="space-y-1 bg-slate-800/80 p-2 rounded border border-slate-700">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium truncate max-w-[200px] text-slate-100" title={item.name}>
                        {item.name}
                      </span>
                      <span className="font-semibold text-indigo-400">{item.percentage}%</span>
                    </div>
                    {item.cnpj && (
                      <span className="text-[10px] text-slate-300 block font-mono">
                        CNPJ: {item.cnpj}
                      </span>
                    )}
                    <Progress value={item.percentage} className="h-1.5 bg-slate-700" />
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === "swot" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* Strengths */}
            <div className="p-3 rounded-lg border border-emerald-900/40 bg-emerald-950/20 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Forças (Strengths)</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5">
                {report.swot.strengths.map((s, idx) => (
                  <li key={idx} className="text-[11px] text-slate-200 leading-snug">
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-3 rounded-lg border border-rose-900/40 bg-rose-950/20 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="size-4 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">Fraquezas (Weaknesses)</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5">
                {report.swot.weaknesses.map((w, idx) => (
                  <li key={idx} className="text-[11px] text-slate-200 leading-snug">
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-3 rounded-lg border border-blue-900/40 bg-blue-950/20 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-blue-400">
                <TrendingUp className="size-4 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">Oportunidades (Opportunities)</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5">
                {report.swot.opportunities.map((o, idx) => (
                  <li key={idx} className="text-[11px] text-slate-200 leading-snug">
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="p-3 rounded-lg border border-amber-900/40 bg-amber-950/20 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="size-4 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">Ameaças (Threats)</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5">
                {report.swot.threats.map((t, idx) => (
                  <li key={idx} className="text-[11px] text-slate-200 leading-snug">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "financial" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Paragraph Description */}
            <div className="space-y-1.5 bg-indigo-950/30 border border-indigo-800/40 p-3.5 rounded-lg">
              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Resumo de Análise Financeira
              </h4>
              <p className="text-xs text-slate-100 leading-relaxed text-justify font-normal">
                {report.financialAnalysis}
              </p>
            </div>

            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Net Revenue */}
              <div className="p-3 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 transition-colors duration-150">
                <span className="text-[10px] text-slate-300 block uppercase font-semibold tracking-wider">
                  Receita Líq. Anual
                </span>
                <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                  {formatCurrencyBRL(report.financialMetrics.netRevenue)}
                </span>
              </div>

              {/* Net Result */}
              <div className={`p-3 rounded-lg border bg-slate-800/60 hover:bg-slate-800 transition-colors duration-150 ${
                report.financialMetrics.netResult < 0 
                  ? "border-rose-900/50" 
                  : "border-slate-700/80"
              }`}>
                <span className="text-[10px] text-slate-300 block uppercase font-semibold tracking-wider">
                  Resultado Líquido
                </span>
                <span className={`text-xs font-bold mt-0.5 block ${
                  report.financialMetrics.netResult < 0 
                    ? "text-rose-400" 
                    : "text-emerald-400"
                }`}>
                  {formatCurrencyBRL(report.financialMetrics.netResult)}
                </span>
              </div>

              {/* Total Assets */}
              <div className="p-3 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 transition-colors duration-150">
                <span className="text-[10px] text-slate-300 block uppercase font-semibold tracking-wider">
                  Ativo Total
                </span>
                <span className="text-xs font-bold text-white mt-0.5 block">
                  {formatCurrencyBRL(report.financialMetrics.totalAssets)}
                </span>
              </div>

              {/* Total Liabilities */}
              <div className="p-3 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 transition-colors duration-150">
                <span className="text-[10px] text-slate-300 block uppercase font-semibold tracking-wider">
                  Passivo Total
                </span>
                <span className="text-xs font-bold text-rose-400 mt-0.5 block">
                  {formatCurrencyBRL(report.financialMetrics.totalLiabilities)}
                </span>
              </div>

              {/* Equity */}
              <div className={`p-3 rounded-lg border bg-slate-800/60 hover:bg-slate-800 transition-colors duration-150 ${
                report.financialMetrics.equity < 0 
                  ? "border-rose-900/50" 
                  : "border-slate-700/80"
              }`}>
                <span className="text-[10px] text-slate-300 block uppercase font-semibold tracking-wider">
                  Patrimônio Líquido
                </span>
                <span className={`text-xs font-bold mt-0.5 block ${
                  report.financialMetrics.equity < 0 
                    ? "text-rose-400" 
                    : "text-emerald-400"
                }`}>
                  {formatCurrencyBRL(report.financialMetrics.equity)}
                </span>
              </div>

              {/* Bank Debt */}
              <div className="p-3 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 transition-colors duration-150">
                <span className="text-[10px] text-slate-300 block uppercase font-semibold tracking-wider">
                  Endividamento Bancário
                </span>
                <span className="text-xs font-bold text-amber-400 mt-0.5 block">
                  {formatCurrencyBRL(report.financialMetrics.bankDebt)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
