import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

type AppShellProps = {
  children: React.ReactNode;
  /** Shown in the top navigation */
  topbarTitle?: string;
  topbarSubtitle?: string;
};

/**
 * AppShell
 * Purpose: shared chrome for every main screen.
 * Desktop = fixed sidebar + content. Mobile = topbar menu + full-width content.
 */
export function AppShell({
  children,
  topbarTitle,
  topbarSubtitle,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:sticky md:top-0 md:flex md:h-screen md:shrink-0">
        <AppSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar title={topbarTitle} subtitle={topbarSubtitle} />
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
