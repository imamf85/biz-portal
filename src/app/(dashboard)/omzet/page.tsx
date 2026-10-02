import { getSummaryResults } from "@/lib/data";
import {
  getActiveRange,
  getActiveRangeValue,
  formatActiveRangeLabel,
} from "@/lib/active-range";
import {
  aggregateByBusiness,
  aggregateByBranch,
  groupOmzetByDate,
} from "@/lib/aggregate";
import { formatRupiah, formatPercent } from "@/lib/format";
import { BRANCH_LABELS, BUSINESS_LABELS, type Business } from "@/lib/business";
import { DateRangeControl } from "@/components/dashboard/date-range-control";
import { OmzetChart } from "@/components/dashboard/omzet-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function OmzetPage() {
  const [{ start, end }, activeValue] = await Promise.all([
    getActiveRange(),
    getActiveRangeValue(),
  ]);
  const rows = await getSummaryResults({ start, end }).catch(() => []);

  const totals = aggregateByBusiness(rows);
  const branchTotals = aggregateByBranch(rows).sort(
    (a, b) => b.totalOmzet - a.totalOmzet
  );
  const chartData = groupOmzetByDate(rows);

  const channelTotals = {
    cash: totals.kebab.omzetCash + totals.lumpia.omzetCash,
    bca: totals.kebab.omzetBca + totals.lumpia.omzetBca,
    gofood: totals.kebab.omzetGofood + totals.lumpia.omzetGofood,
    grabfood: totals.kebab.omzetGrabfood + totals.lumpia.omzetGrabfood,
    shopeefood: totals.kebab.omzetShopeefood + totals.lumpia.omzetShopeefood,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Omzet</h1>
        <p className="text-sm text-muted-foreground">
          Pantau omzet kebab & lumpia per periode
        </p>
      </div>

      <DateRangeControl
        currentValue={activeValue}
        currentLabel={formatActiveRangeLabel(activeValue)}
      />

      <div className="grid grid-cols-2 gap-3">
        {(["kebab", "lumpia"] as Business[]).map((business) => (
          <StatCard
            key={business}
            label={BUSINESS_LABELS[business]}
            value={formatRupiah(totals[business].totalOmzet)}
            sub={`Margin ${formatPercent(totals[business].marginPct)}`}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tren Omzet Harian</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Belum ada data pada periode ini.
            </p>
          ) : (
            <OmzetChart data={chartData} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Breakdown Channel Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Cash" value={formatRupiah(channelTotals.cash)} />
          <StatCard label="BCA" value={formatRupiah(channelTotals.bca)} />
          <StatCard label="GoFood" value={formatRupiah(channelTotals.gofood)} />
          <StatCard
            label="GrabFood"
            value={formatRupiah(channelTotals.grabfood)}
          />
          <StatCard
            label="ShopeeFood"
            value={formatRupiah(channelTotals.shopeefood)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per Cabang</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cabang</TableHead>
                <TableHead className="text-right">Omzet</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branchTotals.map((b) => (
                <TableRow key={b.branch}>
                  <TableCell className="font-medium">
                    {BRANCH_LABELS[b.branch] ?? b.branch}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(b.totalOmzet)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPercent(b.marginPct)}
                  </TableCell>
                </TableRow>
              ))}
              {branchTotals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
