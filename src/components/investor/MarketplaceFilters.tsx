import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

export interface MarketplaceFilterValues {
  minScore: string;
  maxTerm: string;
  maxAmount: string;
  risk: string;
}

interface MarketplaceFiltersProps {
  filters: MarketplaceFilterValues;
  onChange: (filters: MarketplaceFilterValues) => void;
  onReset: () => void;
}

export function MarketplaceFilters({ filters, onChange, onReset }: MarketplaceFiltersProps) {
  function update(key: keyof MarketplaceFilterValues, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">Score mínimo</Label>
            <Input
              type="number"
              placeholder="Ex: 70"
              value={filters.minScore}
              onChange={(e) => update("minScore", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Prazo máximo (dias)</Label>
            <Input
              type="number"
              placeholder="Ex: 120"
              value={filters.maxTerm}
              onChange={(e) => update("maxTerm", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Valor máximo</Label>
            <Input
              type="number"
              placeholder="Ex: 100000"
              value={filters.maxAmount}
              onChange={(e) => update("maxAmount", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Risco</Label>
            <Select value={filters.risk} onValueChange={(v) => update("risk", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="LOW">Baixo</SelectItem>
                <SelectItem value="MEDIUM">Médio</SelectItem>
                <SelectItem value="HIGH">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mt-3 gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="size-3.5" />
            Limpar filtros
          </Button>
          <Button size="sm" variant="default">
            <Search className="size-3.5" />
            Aplicar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
