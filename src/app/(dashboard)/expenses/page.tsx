import Link from "next/link";
import { getExpenses } from "@/lib/sheets/expenses";
import { getSummaryResults, getIngredients } from "@/lib/data";
import {
  getActiveRange,
  getActiveRangeValue,
  formatActiveRangeLabel,
} from "@/lib/active-range";
import {
  getSharedIngredientNames,
  getLumpiaCrossChargeBreakdown,
} from "@/lib/cross-charge";
import { formatRupiah, formatNumber, formatDateId } from "@/lib/format";
import { DateRangeControl } from "@/components/dashboard/date-range-control";
import { cn } from "@/lib/utils";
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
import { ArrowRightLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const BUSINESS_OPTIONS = ["all", "kebab", "lumpia"] as const;
type BusinessFilter = (typeof BUSINESS_OPTIONS)[number];

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const { business: rawBusiness } = await searchParams;
  const business: BusinessFilter = BUSINESS_OPTIONS.includes(
    rawBusiness as BusinessFilter
  )
    ? (rawBusiness as BusinessFilter)
    : "all";

  const [{ start, end }, activeValue] = await Promise.all([
    getActiveRange(),
    getActiveRangeValue(),
  ]);
  const [allExpenses, summaryRows, ingredients] = await Promise.all([
    getExpenses().catch(() => []),
    getSummaryResults({ start, end }).catch(() => []),
    getIngredients().catch(() => []),
  ]);

  const inRange = allExpenses.filter(
    (e) => e.expenseDate >= start && e.expenseDate <= end
  );
  const filtered =
    business === "all" ? inRange : inRange.filter((e) => e.business === business);

  const rawKebabTotal = inRange
    .filter((e) => e.business === "kebab")
    .reduce((sum, e) => sum + e.amount, 0);
  const rawLumpiaTotal = inRange
    .filter((e) => e.business === "lumpia")
    .reduce((sum, e) => sum + e.amount, 0);

  const sharedNames = getSharedIngredientNames(ingredients);
  const crossChargeBreakdown = getLumpiaCrossChargeBreakdown(summaryRows, sharedNames);
  const crossCharge = crossChargeBreakdown.reduce((sum, e) => sum + e.subtotal, 0);
  const allocatedKebabTotal = rawKebabTotal - crossCharge;
  const allocatedLumpiaTotal = rawLumpiaTotal + crossCharge;

  const byCategory = new Map<string, number>();
  for (const e of filtered) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  }
  const categoryList = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Pengeluaran</h1>
        <p className="text-sm text-muted-foreground">
          Dari Google Sheets — sheet Expenses (kebab) & Lumpia-Expenses
        </p>
      </div>

      <DateRangeControl
        currentValue={activeValue}
        currentLabel={formatActiveRangeLabel(activeValue)}
      />

      <div className="flex gap-2">
        {BUSINESS_OPTIONS.map((b) => (
          <Link
            key={b}
            href={`/expenses?business=${b}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              business === b
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            {b === "all" ? "Semua" : b === "kebab" ? "Kebab" : "Lumpia"}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs font-medium text-muted-foreground">Kebab</p>
            <div>
              <p className="text-[11px] text-muted-foreground">
                Tercatat di kas
              </p>
              <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/40">
                {formatRupiah(rawKebabTotal)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                Setelah alokasi
              </p>
              <p className="text-xl font-semibold tracking-tight">
                {formatRupiah(allocatedKebabTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs font-medium text-muted-foreground">Lumpia</p>
            <div>
              <p className="text-[11px] text-muted-foreground">
                Tercatat di kas
              </p>
              <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/40">
                {formatRupiah(rawLumpiaTotal)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                Setelah alokasi
              </p>
              <p className="text-xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatRupiah(allocatedLumpiaTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-sky-300/60 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/20">
        <CardContent className="flex gap-3 p-4">
          <ArrowRightLeft className="size-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">
                {formatRupiah(crossCharge)}
              </strong>{" "}
              dipindahkan dari kebab ke lumpia pada periode ini — nilai ini
              dihitung dari pemakaian aktual bahan bersama (bahan yang ditandai
              &ldquo;Shared&rdquo; di halaman{" "}
              <Link href="/ingredients" className="underline underline-offset-2">
                Bahan Baku
              </Link>
              ) di cabang Cibubur, dikalikan harga satuannya. Kebab yang
              membayar, lumpia yang mengonsumsi, jadi biayanya dialokasikan ke
              lumpia. Total gabungan kebab + lumpia tidak berubah, hanya
              dipindahkan.{" "}
              {crossCharge === 0 && (
                <span>
                  Kalau angka ini 0 padahal seharusnya ada, cek apakah kolom
                  shared sudah diisi di tabel ingredients.
                </span>
              )}
            </p>

            {crossChargeBreakdown.length > 0 && (
              <div className="space-y-1 rounded-md border border-sky-300/50 bg-background/60 p-2 dark:border-sky-900/40">
                {crossChargeBreakdown.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="truncate text-foreground">
                      {entry.name}{" "}
                      <span className="text-muted-foreground">
                        ({formatNumber(entry.qty, 2)} {entry.satuan})
                      </span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatRupiah(entry.subtotal)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-2 border-t border-sky-300/50 pt-1 text-xs font-semibold dark:border-sky-900/40">
                  <span>Total</span>
                  <span className="tabular-nums">{formatRupiah(crossCharge)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per Kategori</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {categoryList.length === 0 && (
            <p className="text-sm text-muted-foreground">Tidak ada data</p>
          )}
          {categoryList.map(([cat, amount]) => (
            <Badge key={cat} variant="secondary" className="gap-1.5 px-2.5 py-1">
              {cat}
              <span className="font-semibold">{formatRupiah(amount)}</span>
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Bisnis</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDateId(e.expenseDate)}
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-sm">
                    {e.description || e.category}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {e.business === "kebab" ? "Kebab" : "Lumpia"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(e.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Tidak ada transaksi
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
