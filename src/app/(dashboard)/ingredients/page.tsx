import { getIngredients } from "@/lib/data";
import { IngredientsList } from "@/components/dashboard/ingredients-list";

export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  const ingredients = await getIngredients().catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Bahan Baku</h1>
        <p className="text-sm text-muted-foreground">
          Harga terkini per satuan — dipakai untuk hitung COGS
        </p>
      </div>
      <IngredientsList ingredients={ingredients} />
    </div>
  );
}
