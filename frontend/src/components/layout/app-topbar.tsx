"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type AppTopbarProps = {
  title?: string;
  subtitle?: string;
};

/**
 * Maps the current URL to a simple topbar title/subtitle.
 * Keeps the chrome correct even on stub pages.
 */
function getTopbarCopy(pathname: string) {
  if (pathname.startsWith("/search/new")) {
    return {
      title: "New Search",
      subtitle: "Configure your next AI lead search",
    };
  }

  if (pathname.includes("/progress")) {
    return {
      title: "Search Progress",
      subtitle: "Watch your AI search as it runs",
    };
  }

  if (pathname.includes("/results")) {
    return {
      title: "Results",
      subtitle: "Review leads from this search",
    };
  }

  if (pathname.includes("/export")) {
    return {
      title: "Export",
      subtitle: "Download leads from this search",
    };
  }

  if (pathname.includes("/leads/")) {
    return {
      title: "Lead Details",
      subtitle: "Full profile for this match",
    };
  }

  if (pathname.startsWith("/settings")) {
    return {
      title: "Settings",
      subtitle: "Personal preferences",
    };
  }

  return {
    title: "Dashboard",
    subtitle: "Overview of your AI lead searches",
  };
}

/**
 * AppTopbar
 * Purpose: top navigation strip.
 * On mobile it opens the sidebar in a Sheet; on desktop it shows page context.
 */
export function AppTopbar({ title, subtitle }: AppTopbarProps) {
  const pathname = usePathname();
  const fallback = getTopbarCopy(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  const resolvedTitle = title ?? fallback.title;
  const resolvedSubtitle = subtitle ?? fallback.subtitle;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur md:h-16 md:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground md:text-base">
          {resolvedTitle}
        </p>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {resolvedSubtitle}
        </p>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AppSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
