import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  LineChart,
  Receipt,
  PiggyBank,
  Carrot,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/omzet", label: "Omzet", icon: LineChart },
  { href: "/expenses", label: "Pengeluaran", icon: Receipt },
  { href: "/margin", label: "Margin", icon: PiggyBank },
  { href: "/ingredients", label: "Bahan", icon: Carrot },
];
