import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cardSurfaceSoft } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type WelcomeHeaderProps = {
  userName?: string;
};

/**
 * WelcomeHeader
 * Purpose: friendly greeting + primary CTA to start a new AI search.
 */
export function WelcomeHeader({ userName = "there" }: WelcomeHeaderProps) {
  return (
    <section
      className={cn(
        cardSurfaceSoft,
        "flex flex-col gap-5 rounded-2xl p-6 md:flex-row md:items-center md:justify-between md:p-8"
      )}
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5" aria-hidden="true" />
          AI Lead Finder
        </div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Welcome back, {userName}
        </h2>
        <p className="max-w-xl text-sm text-muted-foreground md:text-base">
          Review recent searches, spot new leads, or start a fresh AI search in
          a few clicks.
        </p>
      </div>

      <Button asChild size="lg" className="w-full shrink-0 md:w-auto">
        <Link href="/search/new">
          New Search
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </Button>
    </section>
  );
}
