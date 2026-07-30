/**
 * Values collected on the New Search form.
 */
export type NewSearchFormValues = {
  businessType: string;
  country: string;
  state: string;
  city: string;
  /** Search radius in kilometers */
  radius: number;
  maximumResults: number;
  /** Minimum rating from 0–5 */
  minimumRating: number;
  hasWebsite: boolean;
  noWebsite: boolean;
  onlyPoorWebsite: boolean;
  onlyVerified: boolean;
};

/**
 * Simple field-level error messages.
 * Empty string means “no error for this field”.
 */
export type NewSearchFormErrors = Partial<
  Record<keyof NewSearchFormValues | "websiteFilters", string>
>;
