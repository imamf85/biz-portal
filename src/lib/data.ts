import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SummaryResult, Ingredient } from "@/types";

export async function getSummaryResults(opts: {
  start: string;
  end: string;
  branches?: string[];
}): Promise<SummaryResult[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("summary_results")
    .select("*")
    .gte("date", opts.start)
    .lte("date", opts.end)
    .order("date", { ascending: true });

  if (opts.branches?.length) {
    query = query.in("branch", opts.branches);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as SummaryResult[]) ?? [];
}

export async function getIngredients(): Promise<Ingredient[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .order("kategori", { ascending: true })
    .order("nama_bahan", { ascending: true });

  if (error) throw error;
  return (data as Ingredient[]) ?? [];
}
