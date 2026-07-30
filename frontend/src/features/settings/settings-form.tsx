"use client";

import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Loader2, RotateCcw, Save } from "lucide-react";
import { FormField } from "@/components/forms/form-field";
import { FilterCheckbox } from "@/components/forms/filter-checkbox";
import { SectionCard } from "@/components/layout/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { countryOptions } from "@/data/search-form-options";
import { defaultSettings } from "@/data/default-settings";
import { cardSurface } from "@/lib/ui-classes";
import {
  clearSettings,
  loadSettings,
  saveSettings,
} from "@/lib/settings-storage";
import type { AppSettings, ThemePreference } from "@/types/settings";

/**
 * SecretField
 * Purpose: API key input with show/hide toggle.
 */
function SecretField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField label={label} htmlFor={id} hint={hint}>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 pr-10"
          autoComplete="off"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1.5 -translate-y-1/2"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide value" : "Show value"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
    </FormField>
  );
}

/**
 * SettingsForm
 * Purpose: edit personal app preferences and store them in localStorage.
 */
export function SettingsForm() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load once on the client (localStorage is browser-only)
  useEffect(() => {
    setSettings(loadSettings());
    setReady(true);
  }, []);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    // Tiny delay so the Save button feels intentional
    await new Promise((resolve) => setTimeout(resolve, 400));
    saveSettings(settings);

    setSaving(false);
    setSaved(true);
  }

  function handleReset() {
    clearSettings();
    setSettings({
      ...defaultSettings,
      csvExport: { ...defaultSettings.csvExport },
      searchDefaults: { ...defaultSettings.searchDefaults },
    });
    setSaved(false);
  }

  if (!ready) {
    return (
      <div className={`rounded-xl ${cardSurface} px-6 py-16 text-center text-sm text-muted-foreground`}>
        Loading settings…
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* API keys */}
      <SectionCard
        title="Google Maps API Key"
        description="Used later for maps and place lookups (stored only in this browser)."
        contentClassName="space-y-5"
      >
        <SecretField
          id="googleMapsApiKey"
          label="Google Maps API Key"
          hint="Paste your Google Maps Platform key. Leave blank while using mock data."
          value={settings.googleMapsApiKey}
          onChange={(value) => update("googleMapsApiKey", value)}
          placeholder="AIza..."
        />
      </SectionCard>

      <SectionCard
        title="OpenAI API Key"
        description="Used later for AI analysis notes (stored only in this browser)."
      >
        <SecretField
          id="openAiApiKey"
          label="OpenAI API Key"
          hint="Paste your OpenAI secret key. Never commit this value to git."
          value={settings.openAiApiKey}
          onChange={(value) => update("openAiApiKey", value)}
          placeholder="sk-..."
        />
      </SectionCard>

      {/* Default country */}
      <SectionCard
        title="Default Country"
        description="Prefills the New Search country when you start a blank form."
      >
        <FormField
          label="Default Country"
          htmlFor="defaultCountry"
          hint="Pick the country you search most often."
        >
          <Select
            value={settings.defaultCountry}
            onValueChange={(value) => update("defaultCountry", value)}
          >
            <SelectTrigger id="defaultCountry" className="h-10 w-full">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </SectionCard>

      {/* CSV export */}
      <SectionCard
        title="CSV Export Options"
        description="Choose which columns are included by default when exporting."
        contentClassName="space-y-3"
      >
        {(
          [
            {
              key: "includePhone" as const,
              label: "Include Phone",
              hint: "Adds the phone number column to CSV downloads.",
            },
            {
              key: "includeEmail" as const,
              label: "Include Email",
              hint: "Adds the email address column to CSV downloads.",
            },
            {
              key: "includeWebsite" as const,
              label: "Include Website",
              hint: "Adds the website domain column to CSV downloads.",
            },
            {
              key: "includeLeadScore" as const,
              label: "Include Lead Score",
              hint: "Adds the AI fit score column to CSV downloads.",
            },
            {
              key: "includeReviews" as const,
              label: "Include Reviews",
              hint: "Adds rating and review count columns to CSV downloads.",
            },
          ]
        ).map((item) => (
          <FilterCheckbox
            key={item.key}
            id={item.key}
            label={item.label}
            description={item.hint}
            checked={settings.csvExport[item.key]}
            onCheckedChange={(checked) =>
              update("csvExport", {
                ...settings.csvExport,
                [item.key]: checked,
              })
            }
          />
        ))}
      </SectionCard>

      {/* Theme */}
      <SectionCard
        title="Theme"
        description="Preference is saved now. The app still uses dark mode in this build."
      >
        <FormField
          label="Theme preference"
          htmlFor="theme"
          hint="Dark is recommended. Light/System are saved for a future toggle."
        >
          <Select
            value={settings.theme}
            onValueChange={(value) =>
              update("theme", value as ThemePreference)
            }
          >
            <SelectTrigger id="theme" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </SectionCard>

      {/* Search defaults */}
      <SectionCard
        title="Search Defaults"
        description="Starting values for the New Search form."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Default Radius (km)"
            htmlFor="defaultRadius"
            hint="How far from the city center new searches should look."
          >
            <Input
              id="defaultRadius"
              type="number"
              min={1}
              max={200}
              value={settings.searchDefaults.defaultRadius}
              onChange={(event) =>
                update("searchDefaults", {
                  ...settings.searchDefaults,
                  defaultRadius: Number(event.target.value) || 0,
                })
              }
              className="h-10"
            />
          </FormField>

          <FormField
            label="Default Maximum Results"
            htmlFor="defaultMaximumResults"
            hint="Upper limit for how many leads a new search should return."
          >
            <Input
              id="defaultMaximumResults"
              type="number"
              min={1}
              max={500}
              value={settings.searchDefaults.defaultMaximumResults}
              onChange={(event) =>
                update("searchDefaults", {
                  ...settings.searchDefaults,
                  defaultMaximumResults: Number(event.target.value) || 0,
                })
              }
              className="h-10"
            />
          </FormField>

          <FormField
            label="Default Minimum Rating"
            htmlFor="defaultMinimumRating"
            hint="Minimum Google rating (0-5) for new searches."
          >
            <Input
              id="defaultMinimumRating"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={settings.searchDefaults.defaultMinimumRating}
              onChange={(event) =>
                update("searchDefaults", {
                  ...settings.searchDefaults,
                  defaultMinimumRating: Number(event.target.value) || 0,
                })
              }
              className="h-10"
            />
          </FormField>

          <FilterCheckbox
            id="defaultHasWebsite"
            label="Default: Has Website"
            description='When checked, New Search starts with "Has Website" turned on.'
            checked={settings.searchDefaults.defaultHasWebsite}
            onCheckedChange={(checked) =>
              update("searchDefaults", {
                ...settings.searchDefaults,
                defaultHasWebsite: checked,
              })
            }
            className="sm:col-span-2"
          />
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard
        title="Danger Zone"
        description="Reset everything stored in this browser for Lead Finder."
        tone="danger"
      >
        <p className="text-sm text-muted-foreground">
          This clears API keys, defaults, and other saved preferences from
          localStorage. Mock search history in memory/session is separate.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive">
              <RotateCcw className="size-4" />
              Reset all settings
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. Your API keys and preferences will be
                removed from this browser.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>
                Yes, reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SectionCard>

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-border/60 bg-background/90 p-4 shadow-lg shadow-black/20 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {saved
            ? "Settings saved in this browser."
            : "Changes are not saved until you click Save."}
        </p>
        <Button type="submit" disabled={saving} className="sm:min-w-36">
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : saved ? (
            <>
              <Check className="size-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
