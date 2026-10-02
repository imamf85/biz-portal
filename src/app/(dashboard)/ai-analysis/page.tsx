import { getActiveRangeValue, formatActiveRangeLabel } from "@/lib/active-range";
import { DateRangeControl } from "@/components/dashboard/date-range-control";
import { AiAnalysisClient } from "./ai-analysis-client";

export const dynamic = "force-dynamic";

export default async function AiAnalysisPage() {
  const activeValue = await getActiveRangeValue();
  const label = formatActiveRangeLabel(activeValue);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">AI Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Analisis otomatis penjualan vs pengeluaran kebab & lumpia
        </p>
      </div>
      <DateRangeControl currentValue={activeValue} currentLabel={label} />
      <AiAnalysisClient rangeLabel={label} />
    </div>
  );
}
