import { useState } from "react";
import { SellerDashboardSummary } from "@/components/seller/SellerDashboardSummary";
import { SellerDuplicatasPreview } from "@/components/seller/SellerDuplicatasPreview";
import { CardSkeleton, MetricCardsSkeleton, TableSkeleton } from "@/components/shared/PageSkeleton";
import { useAsyncData } from "@/hooks/use-async-data";
import { fetchCurrentSeller } from "@/services/seller.service";
import { fetchDuplicatasBySeller } from "@/services/duplicata.service";
import { canSellerRegisterDuplicatas } from "@/domain/seller/seller-duplicata-access";
import { Wallet, Eye, EyeOff, Clock, TrendingUp, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL } from "@/lib/formatters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DUPLICATAS_COLUMNS = [
  "Número",
  "Sacado",
  { label: "Valor", align: "right" as const },
  "Vencimento",
  { label: "Análise", kind: "pill" as const },
];

export function SellerDashboardPage() {
  const { data, loading } = useAsyncData(async () => {
    const seller = await fetchCurrentSeller();
    const duplicatas = await fetchDuplicatasBySeller(seller.id);
    return { seller, duplicatas };
  }, []);
  const seller = data?.seller ?? null;
  const duplicatas = data?.duplicatas ?? [];
  const [showBalance, setShowBalance] = useState(true);

  // Transfer states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [pixKey, setPixKey] = useState("");
  const [transferAmount, setTransferAmount] = useState<number | "">("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [simulatedTransfersTotal, setSimulatedTransfersTotal] = useState(0);

  const saldoDisponivel = Math.max(
    0,
    duplicatas
      .filter((d) => d.statusRecebivel === "completed" || d.statusRecebivel === "payer_settled")
      .reduce((sum, d) => sum + (d.valorLiquidoAntecipacao ?? 0), 0) - simulatedTransfersTotal
  );

  const saldoEmTransito = duplicatas
    .filter((d) => d.statusRecebivel === "confirmed" || d.statusRecebivel === "funding" || d.statusRecebivel === "funded" || d.statusRecebivel === "processing")
    .reduce((sum, d) => sum + (d.valorLiquidoAntecipacao ?? 0), 0);

  async function handleTransferSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pixKey) {
      toast.error("Por favor, informe uma chave Pix.");
      return;
    }
    const amt = Number(transferAmount);
    if (!amt || amt <= 0) {
      toast.error("Por favor, informe um valor válido.");
      return;
    }
    if (amt > saldoDisponivel) {
      toast.error("Saldo insuficiente para esta transferência.");
      return;
    }

    setIsTransferring(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTransferring(false);
    setTransferSuccess(true);
    setSimulatedTransfersTotal((prev) => prev + amt);
    toast.success("Pix realizado com sucesso!");
  }

  function handleCloseModal() {
    setIsTransferModalOpen(false);
    setPixKey("");
    setTransferAmount("");
    setTransferSuccess(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white flex flex-wrap items-center gap-2.5">
            Dashboard
            {seller && seller.validationStatus === "APPROVED" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-3.5" />
                Conta Validada & Ativa
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">Visão geral das suas duplicatas</p>
        </div>
      </div>

      {loading ? (
        <>
          <CardSkeleton progress lines={3} action />
          <MetricCardsSkeleton count={4} className="grid gap-3 grid-cols-2 lg:grid-cols-4" />
          <TableSkeleton card columns={DUPLICATAS_COLUMNS} rows={5} />
        </>
      ) : (
        <>
          {/* Wallet / Balance header block */}
          <Card className="border-primary/15 bg-zinc-950/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="size-5 text-primary" />
                    <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Conta Digital Dupply</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-3xl font-bold tracking-tight text-white font-mono">
                      {showBalance ? formatCurrencyBRL(saldoDisponivel) : "••••••"}
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-8 text-muted-foreground hover:text-white"
                      onClick={() => setShowBalance(!showBalance)}
                    >
                      {showBalance ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Saldo disponível para transferência imediata (Pix/TED)</p>
                </div>
                
                <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-8">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3 text-warning" />
                      Em processamento
                    </span>
                    <p className="text-lg font-bold text-white font-mono">
                      {showBalance ? formatCurrencyBRL(saldoEmTransito) : "••••••"}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="size-3 text-emerald-400" />
                      Total Antecipado
                    </span>
                    <p className="text-lg font-bold text-white font-mono">
                      {showBalance ? formatCurrencyBRL(saldoDisponivel + saldoEmTransito) : "••••••"}
                    </p>
                  </div>
                </div>

                <div>
                  <Button 
                    onClick={() => setIsTransferModalOpen(true)}
                    disabled={saldoDisponivel <= 0}
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2"
                  >
                    <ArrowUpRight className="size-4" />
                    Transferir Saldo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <SellerDashboardSummary duplicatas={duplicatas} />
          <SellerDuplicatasPreview
            duplicatas={duplicatas}
            canRegisterNew={seller ? canSellerRegisterDuplicatas(seller) : false}
          />

          {/* Transfer Pix Modal */}
          <Dialog open={isTransferModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
            <DialogContent className="sm:max-w-[425px] border-border/80 bg-zinc-950/95 backdrop-blur-xl">
              {transferSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                  <CheckCircle2 className="size-12 text-emerald-500 animate-bounce" />
                  <div className="space-y-2">
                    <DialogTitle className="text-xl font-bold text-white">Transferência Realizada!</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Seu Pix de <strong className="text-white">{formatCurrencyBRL(Number(transferAmount))}</strong> para a chave <code className="text-white">{pixKey}</code> foi efetuado com sucesso e estará disponível em sua conta bancária em instantes.
                    </DialogDescription>
                  </div>
                  <Button onClick={handleCloseModal} className="w-full mt-4">
                    Fechar
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleTransferSubmit}>
                  <DialogHeader className="space-y-1.5">
                    <DialogTitle className="text-lg font-bold text-white">Transferência Pix</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Envie o saldo acumulado de suas antecipações diretamente para a conta da sua empresa.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pixKey" className="text-sm text-muted-foreground">Chave Pix (CNPJ, E-mail ou Celular)</Label>
                      <Input
                        id="pixKey"
                        placeholder="Ex: 00.000.000/0001-00"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        required
                        disabled={isTransferring}
                        className="bg-muted/30 border-border/80 focus-visible:ring-primary text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="amount" className="text-sm text-muted-foreground">Valor a transferir</Label>
                        <span 
                          onClick={() => !isTransferring && setTransferAmount(saldoDisponivel)}
                          className="text-xs text-primary hover:underline cursor-pointer font-medium"
                        >
                          Usar máximo: {formatCurrencyBRL(saldoDisponivel)}
                        </span>
                      </div>
                      <Input
                        id="amount"
                        type="number"
                        min={1}
                        max={saldoDisponivel}
                        step="any"
                        placeholder="0,00"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value === "" ? "" : Number(e.target.value))}
                        required
                        disabled={isTransferring}
                        className="bg-muted/30 border-border/80 focus-visible:ring-primary text-white"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCloseModal}
                      disabled={isTransferring}
                      className="text-muted-foreground hover:text-white"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isTransferring || !pixKey || !transferAmount}
                      className="bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2"
                    >
                      {isTransferring ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Confirmar Pix"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
