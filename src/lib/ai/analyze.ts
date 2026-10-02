import "server-only";
import type { SummaryResult, ExpenseRow, Ingredient } from "@/types";
import { aggregateByBusiness } from "@/lib/aggregate";
import { getSharedIngredientNames, computeLumpiaCrossCharge } from "@/lib/cross-charge";
import { BUSINESS_LABELS, type Business } from "@/lib/business";

function buildPrompt(params: {
  rangeLabel: string;
  summaryRows: SummaryResult[];
  expenses: ExpenseRow[];
  ingredients: Ingredient[];
}) {
  const { rangeLabel, summaryRows, expenses, ingredients } = params;
  const totals = aggregateByBusiness(summaryRows);
  const sharedNames = getSharedIngredientNames(ingredients);
  const crossCharge = computeLumpiaCrossCharge(summaryRows, sharedNames);

  const businessSection = (business: Business) => {
    const t = totals[business];
    const biz = expenses.filter((e) => e.business === business);
    const rawExpenseTotal = biz.reduce((s, e) => s + e.amount, 0);
    const allocatedExpenseTotal =
      business === "kebab"
        ? rawExpenseTotal - crossCharge
        : rawExpenseTotal + crossCharge;
    const byCategory = new Map<string, number>();
    for (const e of biz) {
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
    }
    const categoryLines = Array.from(byCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `  - ${cat}: Rp${amt.toLocaleString("id-ID")}`)
      .join("\n");

    return `### ${BUSINESS_LABELS[business]}
- Total omzet: Rp${t.totalOmzet.toLocaleString("id-ID")}
- COGS (berbasis pemakaian bahan): Rp${t.cogs.toLocaleString("id-ID")}
- Netto (omzet - COGS): Rp${t.netto.toLocaleString("id-ID")}
- Margin: ${t.marginPct.toFixed(1)}%
- Pengeluaran kas tercatat di spreadsheet: Rp${rawExpenseTotal.toLocaleString("id-ID")}
- Pengeluaran setelah alokasi bahan bersama: Rp${allocatedExpenseTotal.toLocaleString("id-ID")}
- Pengeluaran per kategori (sebelum alokasi):
${categoryLines || "  - (tidak ada data)"}`;
  };

  const dailyBreakdown = summaryRows
    .map(
      (r) =>
        `${r.date} | ${r.branch} | omzet Rp${Number(r.total_omzet).toLocaleString("id-ID")} | cogs Rp${Number(r.cogs).toLocaleString("id-ID")} | margin ${Number(r.margin_pct).toFixed(1)}%`
    )
    .join("\n");

  return `Kamu adalah analis bisnis untuk usaha kuliner kecil (kebab dan lumpia) di Indonesia. Analisis data berikut untuk periode ${rangeLabel}.

PENTING tentang data: Kebab beroperasi di cabang Pekayon & Kalisari, Lumpia di cabang Cibubur. Beberapa bahan baku dibeli oleh kebab tapi dipakai juga oleh lumpia. Sebesar Rp${crossCharge.toLocaleString("id-ID")} pada periode ini sudah dialokasikan ulang dari kebab ke lumpia (dihitung dari pemakaian aktual bahan bersama di Cibubur x harga satuan), sehingga angka "pengeluaran setelah alokasi" di bawah ini adalah angka yang adil untuk membandingkan kedua bisnis — pakai angka itu, bukan "pengeluaran kas tercatat". COGS/margin juga sudah usage-based per cabang jadi sudah akurat.

${businessSection("kebab")}

${businessSection("lumpia")}

### Detail harian per cabang
${dailyBreakdown || "(tidak ada data)"}

Tolong berikan analisis singkat dalam Bahasa Indonesia yang mencakup:
1. Ringkasan performa kebab vs lumpia (mana yang lebih sehat marginnya, tren naik/turun)
2. Anomali atau hal yang perlu diwaspadai (margin anjlok di hari/cabang tertentu, pengeluaran tidak wajar, dll)
3. Hubungan antara pola pengeluaran dan omzet — apakah pengeluaran sebanding dengan penjualan?
4. 2-3 rekomendasi actionable untuk pemilik usaha

Format jawaban dengan heading markdown pendek per bagian. Jangan terlalu panjang, maksimal sekitar 400 kata.`;
}

export async function runAiAnalysis(params: {
  rangeLabel: string;
  summaryRows: SummaryResult[];
  expenses: ExpenseRow[];
  ingredients: Ingredient[];
}): Promise<string> {
  const baseUrl = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;

  if (!baseUrl || !apiKey || !model) {
    throw new Error(
      "AI belum dikonfigurasi. Set AI_BASE_URL, AI_API_KEY, dan AI_MODEL di .env.local"
    );
  }

  const prompt = buildPrompt(params);

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah analis bisnis F&B yang tajam, ringkas, dan berbasis data.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI request gagal (${res.status}): ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI response tidak mengandung konten yang bisa dibaca.");
  }

  return content as string;
}
