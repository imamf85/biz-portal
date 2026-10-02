import "server-only";
import { unstable_cache } from "next/cache";
import { getSheetRows } from "./client";
import type { ExpenseRow } from "@/types";
import type { Business } from "@/lib/business";

const HEADER_INDEX = {
  timestamp: 0,
  amount: 1,
  expenseDate: 2,
  toko: 3,
  category: 4,
  description: 5,
  attachment: 6,
  updatedBy: 7,
};

function parseAmount(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseSheetRows(rows: string[][], business: Business): ExpenseRow[] {
  const [, ...dataRows] = rows; // skip header row
  return dataRows
    .filter((r) => r.length > 0 && r[HEADER_INDEX.amount])
    .map((r) => ({
      timestamp: r[HEADER_INDEX.timestamp] ?? "",
      amount: parseAmount(r[HEADER_INDEX.amount]),
      expenseDate: r[HEADER_INDEX.expenseDate] ?? "",
      toko: r[HEADER_INDEX.toko] ?? "",
      category: r[HEADER_INDEX.category] ?? "Lainnya",
      description: r[HEADER_INDEX.description] ?? "",
      attachment: r[HEADER_INDEX.attachment] || null,
      updatedBy: r[HEADER_INDEX.updatedBy] ?? "",
      business,
    }));
}

async function fetchExpenses(): Promise<ExpenseRow[]> {
  const kebabTab = process.env.GOOGLE_SHEETS_KEBAB_TAB || "Expenses";
  const lumpiaTab = process.env.GOOGLE_SHEETS_LUMPIA_TAB || "Lumpia-Expenses";

  const [kebabRows, lumpiaRows] = await Promise.all([
    getSheetRows(kebabTab),
    getSheetRows(lumpiaTab),
  ]);

  const kebab = parseSheetRows(kebabRows, "kebab");
  const lumpia = parseSheetRows(lumpiaRows, "lumpia");

  return [...kebab, ...lumpia].sort((a, b) =>
    a.expenseDate < b.expenseDate ? 1 : -1
  );
}

export const getExpenses = unstable_cache(fetchExpenses, ["expenses"], {
  revalidate: 120,
  tags: ["expenses"],
});
