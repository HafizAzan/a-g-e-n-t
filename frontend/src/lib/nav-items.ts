import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Search,
  Settings,
} from "lucide-react";

/**
 * Sidebar navigation items.
 * Only Dashboard is fully built for now; other links go to stub pages.
 */
export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "New Search",
    href: "/search/new",
    icon: Search,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
