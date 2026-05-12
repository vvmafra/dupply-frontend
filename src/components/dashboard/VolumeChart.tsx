import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MONTHLY_VOLUME_DATA } from "@/data/dashboard.mock";
import { formatCurrencyBRL } from "@/lib/formatters";

export function VolumeChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Volume Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_VOLUME_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrencyBRL(Number(value)), ""]}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Legend formatter={(value) => <span className="text-xs">{value === "volume" ? "Cadastrado" : "Financiado"}</span>} />
              <Bar dataKey="volume" name="Cadastrado" fill="var(--primary)" radius={[3, 3, 0, 0]} opacity={0.8} />
              <Bar dataKey="funded" name="Financiado" fill="var(--chart-2)" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
