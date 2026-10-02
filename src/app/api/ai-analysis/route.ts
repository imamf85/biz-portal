import { NextResponse } from "next/server";
import { getSummaryResults, getIngredients } from "@/lib/data";
import { getExpenses } from "@/lib/sheets/expenses";
import { getActiveRange, formatActiveRangeLabel, getActiveRangeValue } from "@/lib/active-range";
import { runAiAnalysis } from "@/lib/ai/analyze";

export async function POST() {
  try {
    const [{ start, end }, activeValue] = await Promise.all([
      getActiveRange(),
      getActiveRangeValue(),
    ]);

    const [summaryRows, allExpenses, ingredients] = await Promise.all([
      getSummaryResults({ start, end }),
      getExpenses().catch(() => []),
      getIngredients().catch(() => []),
    ]);

    const expenses = allExpenses.filter(
      (e) => e.expenseDate >= start && e.expenseDate <= end
    );

    const analysis = await runAiAnalysis({
      rangeLabel: formatActiveRangeLabel(activeValue),
      summaryRows,
      expenses,
      ingredients,
    });

    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
