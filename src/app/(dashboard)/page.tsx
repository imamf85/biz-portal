import Link from "next/link";
import { getSummaryResults } from "@/lib/data";
import { getExpenses } from "@/lib/sheets/expenses";
import { getRange } from "@/lib/date-range";
import { aggregateByBusiness } from "@/lib/aggregate";
import { formatRupiah, formatPercent, formatDateId } from "@/lib/format";
import { BUSINESS_LABELS, type Business } from "@/lib/business";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Receipt, Sparkles, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const now = new Date();
  const month = getRange("month", now);
  const today = getRange("today", now);
  const week = getRange("week", now);

  const [monthRows, expenses] = await Promise.all([
    getSummaryResults({ start: month.start, end: month.end }).catch(() => []),
    getExpenses().catch(() => []),
  ]);

  const todayRows = monthRows.filter(
    (r) => r.date >= today.start && r.date <= today.end
  );
  const weekRows = monthRows.filter(
    (r) => r.date >= week.start && r.date <= week.end
  );

  const todayTotals = aggregateByBusiness(todayRows);
  const weekTotals = aggregateByBusiness(weekRows);
  const monthTotals = aggregateByBusiness(monthRows);

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Ringkasan Hari Ini</h1>
          <p className="text-sm text-muted-foreground">{formatDateId(now)}</p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/ai-analysis">
            <Sparkles className="size-4" />
            AI Analysis
          </Link>
        </Button>
      </div>

      {(["kebab", "lumpia"] as Business[]).map((business) => (
        <Card key={business}>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">
              {BUSINESS_LABELS[business]}
            </CardTitle>
            <Badge
              variant={
                monthTotals[business].marginPct >= 0 ? "secondary" : "destructive"
              }
            >
              Margin {formatPercent(monthTotals[business].marginPct)}
            </Badge>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            <StatCard
              label="Hari ini"
              value={formatRupiah(todayTotals[business].totalOmzet)}
            />
            <StatCard
              label="Pekan ini"
              value={formatRupiah(weekTotals[business].totalOmzet)}
            />
            <StatCard
              label="Bulan ini"
              value={formatRupiah(monthTotals[business].totalOmzet)}
            />
          </CardContent>
        </Card>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Netto bulan ini"
          value={formatRupiah(
            monthTotals.kebab.netto + monthTotals.lumpia.netto
          )}
          icon={TrendingUp}
          tone="positive"
        />
        <StatCard
          label="COGS bulan ini"
          value={formatRupiah(monthTotals.kebab.cogs + monthTotals.lumpia.cogs)}
          icon={Wallet}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Pengeluaran Terbaru</CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
            <Link href="/expenses">
              Lihat semua <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentExpenses.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Belum ada data pengeluaran, atau koneksi Google Sheets belum
              dikonfigurasi.
            </p>
          )}
          {recentExpenses.map((e, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  <Receipt className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {e.description || e.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateId(e.expenseDate)} ·{" "}
                    {e.business === "kebab" ? "Kebab" : "Lumpia"} · {e.category}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-semibold">
                {formatRupiah(e.amount)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
