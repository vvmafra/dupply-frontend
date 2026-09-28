import { Calculator, Calendar, Info, TrendingDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  SIMULACAO_TARIFA_PERCENT,
  SIMULACAO_TAXA_MENSAL_PERCENT,
  type SimulacaoAntecipacao,
} from "@/domain/duplicata/duplicata-simulacao.helpers";
import { formatCurrencyBRL, formatPercent } from "@/lib/formatters";

/** Live preview of the seller's net amount while the form is being filled. */
export function AntecipacaoSimulator({ simulacao }: Readonly<{ simulacao: SimulacaoAntecipacao }>) {
  return (
    <div className="rounded-xl border bg-card/60 backdrop-blur-md p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-primary font-medium">
        <Calculator className="w-5 h-5" />
        <h3 className="font-semibold text-card-foreground">Simulador de Taxas</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-normal">
        Visualização prévia do valor a ser recebido com base no prazo e taxa média estimada.
      </p>

      <Separator />

      {simulacao.disponivel ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Valor de Face</span>
              <span className="font-medium font-mono">{formatCurrencyBRL(simulacao.valor)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Prazo Estimado</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                {simulacao.dias} {simulacao.dias === 1 ? "dia" : "dias"}
              </span>
            </div>
            <div className="flex justify-between text-xs text-destructive">
              <span className="flex items-center gap-1">
                Deságio Estimado
                <span className="text-[10px] bg-destructive/10 px-1 py-0.5 rounded text-destructive font-mono">
                  {SIMULACAO_TAXA_MENSAL_PERCENT}% a.m.
                </span>
              </span>
              <span className="font-medium font-mono">-{formatCurrencyBRL(simulacao.desconto)}</span>
            </div>
            <div className="flex justify-between text-xs text-destructive">
              <span className="flex items-center gap-1">
                Tarifa de Serviço
                <span className="text-[10px] bg-destructive/10 px-1 py-0.5 rounded text-destructive font-mono">
                  {SIMULACAO_TARIFA_PERCENT}% flat
                </span>
              </span>
              <span className="font-medium font-mono">-{formatCurrencyBRL(simulacao.tarifa)}</span>
            </div>
          </div>

          <Separator />

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-primary/70">
              Líquido Estimado a Receber
            </div>
            <div className="text-2xl font-bold font-mono text-primary leading-none">
              {formatCurrencyBRL(simulacao.liquido)}
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1">
              <TrendingDown className="w-3 h-3 text-destructive" />
              Custo Efetivo Estimado: {formatPercent(simulacao.custoPercent, 2)}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center space-y-2">
          <Info className="w-8 h-8 text-muted-foreground/50 mx-auto" />
          <p className="text-xs text-muted-foreground leading-relaxed px-4">
            Preencha o <strong>Valor do Título</strong> e a <strong>Data de Vencimento</strong> para habilitar o
            simulador em tempo real.
          </p>
        </div>
      )}

      <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground leading-normal flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
        <span>
          Os valores acima são estimativas de mercado. As taxas definitivas serão ofertadas pelo analista de risco
          da Dupply após a validação oficial do título.
        </span>
      </div>
    </div>
  );
}
