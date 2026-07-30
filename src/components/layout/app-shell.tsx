"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppStateProvider } from "@/providers/app-state";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </AppStateProvider>
  );
}
