export type ItemsMap = Record<string, number>;

export interface CogsBreakdownEntry {
  qty: number;
  harga: number;
  satuan: string;
  subtotal: number;
  note?: string;
}

export interface SummaryResult {
  id: number;
  date: string;
  branch: string;
  opening_cash: number;
  omzet_cash: number;
  omzet_bca: number;
  omzet_gofood: number;
  omzet_grabfood: number;
  omzet_shopeefood: number;
  total_omzet: number;
  cogs: number;
  netto: number;
  margin_pct: number;
  usage_items: ItemsMap | null;
  cogs_breakdown: Record<string, CogsBreakdownEntry> | null;
  omzet_estimate_low: number | null;
  omzet_estimate_high: number | null;
  anomali_notes: string | null;
  prediction_analysis: string | null;
  opened_by: string | null;
  closed_by: string | null;
  opening_note: string | null;
  closing_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailySummary {
  date: string;
  branch: string;
  opening_cash: number;
  opening_items: ItemsMap | null;
  opening_note: string | null;
  opened_by: string | null;
  omzet_cash: number | null;
  omzet_bca: number | null;
  omzet_gofood: number | null;
  omzet_grabfood: number | null;
  omzet_shopeefood: number | null;
  total_omzet: number | null;
  closing_items: ItemsMap | null;
  closing_note: string | null;
  closed_by: string | null;
  closing_updated_at: string | null;
}

export interface Ingredient {
  id: number;
  nama_bahan: string;
  kategori: string | null;
  satuan: string;
  harga_per_satuan: number;
  aktif: boolean;
  shared_with_lumpia: boolean;
  updated_at: string;
}

export type ExpenseCategory =
  | "Operasional"
  | "Bahan Baku"
  | "Konsumsi"
  | "Transportasi"
  | string;

export interface ExpenseRow {
  timestamp: string;
  amount: number;
  expenseDate: string;
  toko: string;
  category: ExpenseCategory;
  description: string;
  attachment: string | null;
  updatedBy: string;
  business: "kebab" | "lumpia";
}
