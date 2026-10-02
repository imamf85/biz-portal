"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";
import { LogOut } from "lucide-react";

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-background md:flex">
      <div className="px-5 py-5">
        <p className="text-lg font-semibold">Biz Portal</p>
        <p className="text-xs text-muted-foreground">Kebab & Lumpia</p>
      </div>
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <form action={logout} className="p-3">
        <SubmitButton
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          pendingText="Keluar..."
        >
          <LogOut className="size-4" />
          Keluar
        </SubmitButton>
      </form>
    </aside>
  );
}
