import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/features/settings/settings-form";

/**
 * SettingsView
 * Purpose: page header + settings form composition.
 */
export function SettingsView() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Settings"
        description="Personal preferences for your Lead Finder. Everything is stored in this browser only — no backend yet."
      />

      <SettingsForm />
    </div>
  );
}
