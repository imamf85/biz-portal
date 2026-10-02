"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createIngredient, updateIngredient } from "@/app/actions/ingredients";
import type { Ingredient } from "@/types";

export function IngredientFormDialog({
  ingredient,
  trigger,
}: {
  ingredient?: Ingredient;
  trigger: ReactNode;
}) {
  const isEdit = !!ingredient;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [namaBahan, setNamaBahan] = useState(ingredient?.nama_bahan ?? "");
  const [kategori, setKategori] = useState(ingredient?.kategori ?? "");
  const [satuan, setSatuan] = useState(ingredient?.satuan ?? "");
  const [harga, setHarga] = useState(
    ingredient ? String(ingredient.harga_per_satuan) : ""
  );
  const [aktif, setAktif] = useState(ingredient?.aktif ?? true);
  const [shared, setShared] = useState(ingredient?.shared_with_lumpia ?? false);

  function resetFields() {
    setNamaBahan(ingredient?.nama_bahan ?? "");
    setKategori(ingredient?.kategori ?? "");
    setSatuan(ingredient?.satuan ?? "");
    setHarga(ingredient ? String(ingredient.harga_per_satuan) : "");
    setAktif(ingredient?.aktif ?? true);
    setShared(ingredient?.shared_with_lumpia ?? false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = {
      nama_bahan: namaBahan,
      kategori,
      satuan,
      harga_per_satuan: Number(harga),
      aktif,
      shared_with_lumpia: shared,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateIngredient(ingredient.id, input)
        : await createIngredient(input);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Bahan diperbarui" : "Bahan ditambahkan");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) resetFields();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Bahan" : "Tambah Bahan Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="nama_bahan">Nama Bahan</Label>
            <Input
              id="nama_bahan"
              value={namaBahan}
              onChange={(e) => setNamaBahan(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="kategori">Kategori</Label>
              <Input
                id="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="mis. Burger"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="satuan">Satuan</Label>
              <Input
                id="satuan"
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                placeholder="mis. g, pcs, ml"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="harga">Harga per Satuan (Rp)</Label>
            <Input
              id="harga"
              type="number"
              min="0"
              step="1"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                checked={aktif}
                onChange={(e) => setAktif(e.target.checked)}
              />
              Aktif
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                checked={shared}
                onChange={(e) => setShared(e.target.checked)}
              />
              Shared dengan Lumpia (dipakai juga di Cibubur)
            </label>
          </div>
          {isEdit && namaBahan.trim() !== ingredient.nama_bahan && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Mengubah nama bahan bisa memutus kecocokan dengan riwayat
              pemakaian (cogs_breakdown) yang masih memakai nama lama.
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
