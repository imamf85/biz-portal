import { getSummaryResults } from "@/lib/data";
import {
  getActiveRange,
  getActiveRangeValue,
  formatActiveRangeLabel,
} from "@/lib/active-range";
import { aggregateByBranch, groupMarginByDate } from "@/lib/aggregate";
import { aggregateByBusiness } from "@/lib/aggregate";
import { formatRupiah, formatPercent } from "@/lib/format";
import { BRANCH_LABELS, BUSINESS_LABELS, type Business } from "@/lib/business";
import { DateRangeControl } from "@/components/dashboard/date-range-control";
import { MarginChart } from "@/components/dashboard/margin-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function MarginPage() {
  const [{ start, end }, activeValue] = await Promise.all([
    getActiveRange(),
    getActiveRangeValue(),
  ]);
  const rows = await getSummaryResults({ start, end }).catch(() => []);

  const totals = aggregateByBusiness(rows);
  const branchTotals = aggregateByBranch(rows).sort(
    (a, b) => b.totalOmzet - a.totalOmzet
  );
  const marginTrend = groupMarginByDate(rows);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Gross Margin</h1>
        <p className="text-sm text-muted-foreground">
          Omzet dikurangi COGS (berbasis pemakaian bahan aktual per cabang)
        </p>
      </div>

      <DateRangeControl
        currentValue={activeValue}
        currentLabel={formatActiveRangeLabel(activeValue)}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(["kebab", "lumpia"] as Business[]).map((business) => (
          <Card key={business}>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">
                {BUSINESS_LABELS[business]}
              </CardTitle>
              <Badge
                variant={
                  totals[business].marginPct >= 0 ? "secondary" : "destructive"
                }
              >
                {formatPercent(totals[business].marginPct)}
              </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Omzet</p>
                <p className="font-semibold">
                  {formatRupiah(totals[business].totalOmzet)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">COGS</p>
                <p className="font-semibold">
                  {formatRupiah(totals[business].cogs)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Netto</p>
                <p className="font-semibold">
                  {formatRupiah(totals[business].netto)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tren Margin (%)</CardTitle>
        </CardHeader>
        <CardContent>
          {marginTrend.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Belum ada data pada periode ini.
            </p>
          ) : (
            <MarginChart data={marginTrend} />
          )}
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
                <TableHead className="text-right">COGS</TableHead>
                <TableHead className="text-right">Netto</TableHead>
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
                    {formatRupiah(b.cogs)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(b.netto)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPercent(b.marginPct)}
                  </TableCell>
                </TableRow>
              ))}
              {branchTotals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
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
