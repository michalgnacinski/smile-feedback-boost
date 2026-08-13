import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface OverviewProps {
  stats?: {
    totalScans: number;
    totalClicks: number;
    conversionRate: string;
    estimatedReviews: number;
  };
  chartData?: Array<{ date: string; skany: number }>;
}

export function Overview({ stats, chartData }: OverviewProps) {
  return (
    <div className="space-y-6">
      {/* STATYSTYKI */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wszystkie skany QR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalScans ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Ostatnie 14 dni</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Przejścia do Google
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalClicks ?? 0}</div>
            <p className="mt-1 text-xs font-medium text-primary">
              Konwersja {stats?.conversionRate ?? "0%"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Szacowane nowe opinie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">~{stats?.estimatedReviews ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">W tym miesiącu</p>
          </CardContent>
        </Card>
      </div>

      {/* RYSOWANIE WYKRESU */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Liczba skanów QR w ostatnich 14 dniach</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-60 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData || []}
                margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSkany" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd" // Auto-dopasowanie ilości dat
                  minTickGap={25} // Bezpieczny odstęp między datami
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#FFF",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  itemStyle={{ color: "#F59E0B", fontWeight: "bold" }}
                  labelStyle={{ color: "#94A3B8", marginBottom: "2px" }}
                />
                <Area
                  type="monotone"
                  dataKey="skany"
                  name="Skany QR"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSkany)"
                  dot={{ fill: "#F59E0B", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#F59E0B", stroke: "#FFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}