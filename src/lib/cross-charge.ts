import type { SummaryResult, Ingredient } from "@/types";

/**
 * Some ingredients are purchased by kebab but also consumed by lumpia
 * (cibubur). cogs_breakdown already values lumpia's actual usage of those
 * ingredients at the branch level (usage-based, from opening/closing stock).
 * The cross-charge is that value moved from kebab's recorded cash expense to
 * lumpia's, so the "Pengeluaran" view reflects who actually consumed the cost,
 * not just who paid for it.
 */
export function getSharedIngredientNames(ingredients: Ingredient[]): Set<string> {
  return new Set(
    ingredients.filter((i) => i.shared_with_lumpia).map((i) => i.nama_bahan)
  );
}

export function computeLumpiaCrossCharge(
  summaryRows: SummaryResult[],
  sharedNames: Set<string>
): number {
  if (sharedNames.size === 0) return 0;

  let total = 0;
  for (const row of summaryRows) {
    if (row.branch !== "cibubur" || !row.cogs_breakdown) continue;
    for (const [name, entry] of Object.entries(row.cogs_breakdown)) {
      if (sharedNames.has(name)) {
        total += Number(entry.subtotal) || 0;
      }
    }
  }
  return total;
}
