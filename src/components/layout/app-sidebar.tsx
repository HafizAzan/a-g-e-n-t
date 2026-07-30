'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppState } from '@/providers/app-state';
import { Eye, Mail, PanelLeft, PanelLeftClose, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Lead Finder',
    description: 'Generate & upload',
    icon: Search,
  },
  {
    href: '/outreach',
    label: 'Email Outreach',
    description: 'Gmail bulk send',
    icon: Mail,
  },
  {
    href: '/preview',
    label: 'Bulk Preview',
    description: 'Review & approve',
    icon: Eye,
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { leads, selectedIndexes, drafts } = useAppState();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-card/40 transition-[width] duration-200',
        collapsed ? 'w-15' : 'w-64',
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-4">
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">AI Lead Finder</p>
            <p className="truncate text-xs text-muted-foreground">Internal tool</p>
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 shrink-0 p-0"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft /> : <PanelLeftClose />}
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition',
                active
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
              )}
              title={item.label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? (
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {!collapsed ? (
        <div className="space-y-1 border-t border-border px-4 py-4 text-xs text-muted-foreground">
          <p>
            Leads: <span className="text-foreground">{leads.length}</span>
          </p>
          <p>
            Selected: <span className="text-foreground">{selectedIndexes.length}</span>
          </p>
          <p>
            Drafts: <span className="text-foreground">{drafts.length}</span>
          </p>
        </div>
      ) : null}
    </aside>
  );
}
