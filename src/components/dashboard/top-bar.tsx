import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div>
        <p className="text-sm font-semibold leading-none">Biz Portal</p>
        <p className="text-[11px] text-muted-foreground">Kebab & Lumpia</p>
      </div>
      <form action={logout}>
        <Button variant="ghost" size="icon" className="size-8">
          <LogOut className="size-4" />
        </Button>
      </form>
    </header>
  );
}
