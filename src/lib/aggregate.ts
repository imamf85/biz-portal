import type { SummaryResult } from "@/types";
import { businessForBranch, type Business } from "@/lib/business";

export interface BusinessTotals {
  business: Business;
  totalOmzet: number;
  cogs: number;
  netto: number;
  marginPct: number;
  omzetCash: number;
  omzetBca: number;
  omzetGofood: number;
  omzetGrabfood: number;
  omzetShopeefood: number;
}

function emptyTotals(business: Business): BusinessTotals {
  return {
    business,
    totalOmzet: 0,
    cogs: 0,
    netto: 0,
    marginPct: 0,
    omzetCash: 0,
    omzetBca: 0,
    omzetGofood: 0,
    omzetGrabfood: 0,
    omzetShopeefood: 0,
  };
}

export function aggregateByBusiness(
  rows: SummaryResult[]
): Record<Business, BusinessTotals> {
  const result: Record<Business, BusinessTotals> = {
    kebab: emptyTotals("kebab"),
    lumpia: emptyTotals("lumpia"),
  };

  for (const row of rows) {
    const business = businessForBranch(row.branch);
    const acc = result[business];
    acc.totalOmzet += Number(row.total_omzet) || 0;
    acc.cogs += Number(row.cogs) || 0;
    acc.omzetCash += Number(row.omzet_cash) || 0;
    acc.omzetBca += Number(row.omzet_bca) || 0;
    acc.omzetGofood += Number(row.omzet_gofood) || 0;
    acc.omzetGrabfood += Number(row.omzet_grabfood) || 0;
    acc.omzetShopeefood += Number(row.omzet_shopeefood) || 0;
  }

  for (const business of ["kebab", "lumpia"] as Business[]) {
    const acc = result[business];
    acc.netto = acc.totalOmzet - acc.cogs;
    acc.marginPct = acc.totalOmzet === 0 ? 0 : (acc.netto / acc.totalOmzet) * 100;
  }

  return result;
}

export interface BranchTotals extends BusinessTotals {
  branch: string;
}

export function aggregateByBranch(rows: SummaryResult[]): BranchTotals[] {
  const map = new Map<string, BranchTotals>();

  for (const row of rows) {
    const branch = row.branch;
    if (!map.has(branch)) {
      map.set(branch, { ...emptyTotals(businessForBranch(branch)), branch });
    }
    const acc = map.get(branch)!;
    acc.totalOmzet += Number(row.total_omzet) || 0;
    acc.cogs += Number(row.cogs) || 0;
    acc.omzetCash += Number(row.omzet_cash) || 0;
    acc.omzetBca += Number(row.omzet_bca) || 0;
    acc.omzetGofood += Number(row.omzet_gofood) || 0;
    acc.omzetGrabfood += Number(row.omzet_grabfood) || 0;
    acc.omzetShopeefood += Number(row.omzet_shopeefood) || 0;
  }

  const list = Array.from(map.values());
  for (const acc of list) {
    acc.netto = acc.totalOmzet - acc.cogs;
    acc.marginPct = acc.totalOmzet === 0 ? 0 : (acc.netto / acc.totalOmzet) * 100;
  }

  return list;
}

export interface DailyPoint {
  date: string;
  kebab: number;
  lumpia: number;
}

export function groupOmzetByDate(rows: SummaryResult[]): DailyPoint[] {
  const map = new Map<string, DailyPoint>();

  for (const row of rows) {
    const business = businessForBranch(row.branch);
    if (!map.has(row.date)) {
      map.set(row.date, { date: row.date, kebab: 0, lumpia: 0 });
    }
    const point = map.get(row.date)!;
    point[business] += Number(row.total_omzet) || 0;
  }

  return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function groupMarginByDate(rows: SummaryResult[]): DailyPoint[] {
  const omzetMap = new Map<string, { kebab: number; lumpia: number }>();
  const cogsMap = new Map<string, { kebab: number; lumpia: number }>();

  for (const row of rows) {
    const business = businessForBranch(row.branch);
    if (!omzetMap.has(row.date)) {
      omzetMap.set(row.date, { kebab: 0, lumpia: 0 });
      cogsMap.set(row.date, { kebab: 0, lumpia: 0 });
    }
    omzetMap.get(row.date)![business] += Number(row.total_omzet) || 0;
    cogsMap.get(row.date)![business] += Number(row.cogs) || 0;
  }

  return Array.from(omzetMap.keys())
    .sort()
    .map((date) => {
      const omzet = omzetMap.get(date)!;
      const cogs = cogsMap.get(date)!;
      const marginFor = (business: Business) =>
        omzet[business] === 0
          ? 0
          : ((omzet[business] - cogs[business]) / omzet[business]) * 100;
      return { date, kebab: marginFor("kebab"), lumpia: marginFor("lumpia") };
    });
}
