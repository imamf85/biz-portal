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

// Google Sheets returns date cells as locale-formatted strings (e.g. "10/2/2026"
// M/D/YYYY) rather than ISO, but downstream range filters compare expenseDate
// as a plain ISO string. Normalize here so both sheets sort/filter correctly.
function parseExpenseDate(raw: string | undefined): string {
  if (!raw) return "";
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const usMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return raw;
}

function parseSheetRows(rows: string[][], business: Business): ExpenseRow[] {
  const [, ...dataRows] = rows; // skip header row
  return dataRows
    .filter((r) => r.length > 0 && r[HEADER_INDEX.amount])
    .map((r) => ({
      timestamp: r[HEADER_INDEX.timestamp] ?? "",
      amount: parseAmount(r[HEADER_INDEX.amount]),
      expenseDate: parseExpenseDate(r[HEADER_INDEX.expenseDate]),
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
