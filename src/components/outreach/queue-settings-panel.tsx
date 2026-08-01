"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_QUEUE_SETTINGS,
  loadQueueSettings,
  resetQueueSettings,
  saveQueueSettings,
} from "@/lib/queue";
import type { QueueSettings } from "@/types/queue";

type QueueSettingsPanelProps = {
  onSettingsChange?: (settings: QueueSettings) => void;
};

export function QueueSettingsPanel({ onSettingsChange }: QueueSettingsPanelProps) {
  const [settings, setSettings] = useState<QueueSettings>(DEFAULT_QUEUE_SETTINGS);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadQueueSettings();
    setSettings(saved);
    onSettingsChange?.(saved);
  }, [onSettingsChange]);

  function updateField(field: keyof QueueSettings, value: string) {
    setValidationError(null);
    setNotice(null);
    setSettings((prev) => ({
      ...prev,
      [field]: value === "" ? 0 : Number(value),
    }));
  }

  function handleSave() {
    const error = saveQueueSettings(settings);
    if (error) {
      setValidationError(error);
      setNotice(null);
      return;
    }

    setValidationError(null);
    setNotice("Queue settings saved.");
    onSettingsChange?.(settings);
  }

  function handleReset() {
    const defaults = resetQueueSettings();
    setSettings(defaults);
    setValidationError(null);
    setNotice("Queue settings reset to default.");
    onSettingsChange?.(defaults);
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card/40 p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-medium">Queue Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure the random delay between each email. A new delay is chosen
          for every email in the queue.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="minDelaySeconds">Minimum Delay (seconds)</Label>
          <Input
            id="minDelaySeconds"
            type="number"
            min={5}
            max={600}
            value={settings.minDelaySeconds}
            onChange={(e) => updateField("minDelaySeconds", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxDelaySeconds">Maximum Delay (seconds)</Label>
          <Input
            id="maxDelaySeconds"
            type="number"
            min={5}
            max={600}
            value={settings.maxDelaySeconds}
            onChange={(e) => updateField("maxDelaySeconds", e.target.value)}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Default: {DEFAULT_QUEUE_SETTINGS.minDelaySeconds}s –{" "}
        {DEFAULT_QUEUE_SETTINGS.maxDelaySeconds}s · Min allowed: 5s · Max allowed:
        600s
      </p>

      {validationError ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {validationError}
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {notice}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleSave}>
          Save Settings
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
      </div>
    </section>
  );
}
