import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, MousePointerClick, ScanLine, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountUpText } from "@/hooks/use-count-up";
import { scanSeries } from "@/lib/mock-data";

const stats = [
  {
    label: "Wszystkie skany QR",
    value: 248,
    decimals: 0,
    suffix: "",
    prefix: "",
    icon: ScanLine,
    note: "+18% vs poprzedni tydzień",
    positive: true,
  },
  {
    label: "Przejścia do Google",
    value: 164,
    decimals: 0,
    suffix: "",
    prefix: "",
    icon: MousePointerClick,
    note: "Konwersja 66,1%",
    positive: true,
  },
  {
    label: "Szacowane nowe opinie",
    value: 28,
    decimals: 0,
    suffix: "",
    prefix: "~",
    icon: Sparkles,
    note: "w tym miesiącu",
    positive: false,
  },
];

export function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <Card
            key={s.label}
            className="spring-in hover-lift border-border bg-card"
            style={{ animationDelay: `${120 + i * 90}ms` }}
          >

            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
                <span className="min-w-0 truncate">{s.label}</span>
                <s.icon className="size-4 shrink-0 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums">
                <CountUpText
                  value={s.value}
                  decimals={s.decimals}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  delay={i * 90}
                />
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                {s.positive && <ArrowUpRight className="size-3 text-success" />}
                {s.note}
              </p>
            </CardContent>
          </Card>
        ))}

        <Card
          className="spring-in hover-lift border-primary/40 bg-card"
          style={{ animationDelay: "390ms" }}
        >

          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status subskrypcji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary">
              Okres próbny (zostało 9 dni)
            </Badge>
            <p className="mt-3 text-xs text-muted-foreground">
              Plan Gastro Starter — 99 PLN netto / msc po okresie próbnym
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rise-in border-border bg-card" style={{ animationDelay: "340ms" }}>
        <CardHeader>
          <CardTitle className="text-base">Liczba skanów QR w ostatnich 14 dniach</CardTitle>
        </CardHeader>
        <CardContent className="h-72 pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scanSeries} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <ReTooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="skany"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive
                animationBegin={450}
                animationDuration={1400}
                animationEasing="ease-out"
              />

            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
