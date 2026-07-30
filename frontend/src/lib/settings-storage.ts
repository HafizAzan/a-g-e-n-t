import { defaultSettings, SETTINGS_STORAGE_KEY } from '@/data/default-settings';
import type { AppSettings } from '@/types/settings';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw)
      return {
        ...defaultSettings,
        csvExport: { ...defaultSettings.csvExport },
        searchDefaults: { ...defaultSettings.searchDefaults },
      };

    const parsed = JSON.parse(raw) as Partial<AppSettings>;

    return {
      ...defaultSettings,
      ...parsed,
      csvExport: {
        ...defaultSettings.csvExport,
        ...parsed.csvExport,
      },
      searchDefaults: {
        ...defaultSettings.searchDefaults,
        ...parsed.searchDefaults,
      },
    };
  } catch {
    return {
      ...defaultSettings,
      csvExport: { ...defaultSettings.csvExport },
      searchDefaults: { ...defaultSettings.searchDefaults },
    };
  }
}

/**
 * Save settings to localStorage (mock “backend”).
 */
export function saveSettings(settings: AppSettings) {
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Remove saved settings so defaults apply again.
 */
export function clearSettings() {
  window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
}
