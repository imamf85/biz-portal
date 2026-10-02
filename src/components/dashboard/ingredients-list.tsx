"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah, formatDateId } from "@/lib/format";
import { Search } from "lucide-react";
import type { Ingredient } from "@/types";

export function IngredientsList({ ingredients }: { ingredients: Ingredient[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter(
      (i) =>
        i.nama_bahan.toLowerCase().includes(q) ||
        (i.kategori ?? "").toLowerCase().includes(q)
    );
  }, [ingredients, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Ingredient[]>();
    for (const item of filtered) {
      const key = item.kategori ?? "Lainnya";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari bahan..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {grouped.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Tidak ada bahan ditemukan
        </p>
      )}

      {grouped.map(([kategori, items]) => (
        <div key={kategori} className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {kategori}
          </h3>
          <Card>
            <CardContent className="divide-y p-0">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">
                        {item.nama_bahan}
                      </p>
                      {item.shared_with_lumpia && (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          Shared
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      per {item.satuan} · update {formatDateId(item.updated_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!item.aktif && (
                      <Badge variant="outline" className="text-[10px]">
                        Nonaktif
                      </Badge>
                    )}
                    <p className="text-sm font-semibold tabular-nums">
                      {formatRupiah(item.harga_per_satuan)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
