export type Business = "kebab" | "lumpia";

export const BRANCHES_BY_BUSINESS: Record<Business, string[]> = {
  kebab: ["pekayon", "kalisari"],
  lumpia: ["cibubur"],
};

export const ALL_BRANCHES = ["pekayon", "kalisari", "cibubur"] as const;

export function businessForBranch(branch: string): Business {
  return BRANCHES_BY_BUSINESS.lumpia.includes(branch) ? "lumpia" : "kebab";
}

export const BRANCH_LABELS: Record<string, string> = {
  pekayon: "Pekayon",
  kalisari: "Kalisari",
  cibubur: "Cibubur",
};

export const BUSINESS_LABELS: Record<Business, string> = {
  kebab: "Kebab",
  lumpia: "Lumpia",
};
