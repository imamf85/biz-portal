"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface IngredientInput {
  nama_bahan: string;
  kategori: string;
  satuan: string;
  harga_per_satuan: number;
  aktif: boolean;
  shared_with_lumpia: boolean;
}

function validate(input: IngredientInput): string | null {
  if (!input.nama_bahan.trim()) return "Nama bahan wajib diisi";
  if (!input.satuan.trim()) return "Satuan wajib diisi";
  if (!Number.isFinite(input.harga_per_satuan) || input.harga_per_satuan < 0) {
    return "Harga per satuan harus angka 0 atau lebih";
  }
  return null;
}

export async function createIngredient(
  input: IngredientInput
): Promise<{ error?: string }> {
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const supabase = createAdminClient();
  const { error } = await supabase.from("ingredients").insert({
    nama_bahan: input.nama_bahan.trim(),
    kategori: input.kategori.trim() || null,
    satuan: input.satuan.trim(),
    harga_per_satuan: input.harga_per_satuan,
    aktif: input.aktif,
    shared_with_lumpia: input.shared_with_lumpia,
  });

  if (error) return { error: error.message };

  revalidatePath("/ingredients");
  return {};
}

export async function updateIngredient(
  id: number,
  input: IngredientInput
): Promise<{ error?: string }> {
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("ingredients")
    .update({
      nama_bahan: input.nama_bahan.trim(),
      kategori: input.kategori.trim() || null,
      satuan: input.satuan.trim(),
      harga_per_satuan: input.harga_per_satuan,
      aktif: input.aktif,
      shared_with_lumpia: input.shared_with_lumpia,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/ingredients");
  return {};
}
