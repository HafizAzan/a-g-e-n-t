import type { AppSettings } from '@/types/settings';

export const SETTINGS_STORAGE_KEY = 'lead-finder:settings';

export const defaultSettings: AppSettings = {
  googleMapsApiKey: '',
  openAiApiKey: '',
  defaultCountry: 'United States',
  csvExport: {
    includePhone: true,
    includeEmail: true,
    includeWebsite: true,
    includeLeadScore: true,
    includeReviews: false,
  },
  theme: 'dark',
  searchDefaults: {
    defaultRadius: 25,
    defaultMaximumResults: 50,
    defaultMinimumRating: 3.5,
    defaultHasWebsite: true,
  },
};
