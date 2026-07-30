/**
 * Settings saved in the browser (mock — no backend).
 */
export type ThemePreference = "dark" | "light" | "system";

export type CsvExportOptions = {
  includePhone: boolean;
  includeEmail: boolean;
  includeWebsite: boolean;
  includeLeadScore: boolean;
  includeReviews: boolean;
};

export type SearchDefaultSettings = {
  defaultRadius: number;
  defaultMaximumResults: number;
  defaultMinimumRating: number;
  defaultHasWebsite: boolean;
};

export type AppSettings = {
  googleMapsApiKey: string;
  openAiApiKey: string;
  defaultCountry: string;
  csvExport: CsvExportOptions;
  theme: ThemePreference;
  searchDefaults: SearchDefaultSettings;
};
