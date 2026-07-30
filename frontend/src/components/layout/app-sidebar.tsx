"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { mainNavItems } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  /** Extra classes for the aside element */
  className?: string;
  /** Called after a nav click (used to close the mobile sheet) */
  onNavigate?: () => void;
};

/**
 * AppSidebar
 * Purpose: primary navigation for Lead Finder.
 * Highlights the active route using the current pathname.
 */
export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-border/60 bg-card/40",
        className
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-secondary">
          <Search className="size-4 text-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">Lead Finder</p>
          <p className="text-xs text-muted-foreground">AI · Personal</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 px-5 py-4">
        <p className="text-xs text-muted-foreground">
          Internal tool · dark mode
        </p>
      </div>
    </aside>
  );
}
