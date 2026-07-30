import { AppShell } from "@/components/layout/app-shell";

/**
 * Shared layout for all main app screens.
 * Adds Sidebar + Top Navigation around every child page.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
