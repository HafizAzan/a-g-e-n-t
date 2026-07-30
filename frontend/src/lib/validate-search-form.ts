import type {
  NewSearchFormErrors,
  NewSearchFormValues,
} from "@/types/new-search";

/** Default values when the form first loads */
export const defaultSearchFormValues: NewSearchFormValues = {
  businessType: "",
  country: "",
  state: "",
  city: "",
  radius: 25,
  maximumResults: 50,
  minimumRating: 3.5,
  hasWebsite: true,
  noWebsite: false,
  onlyPoorWebsite: false,
  onlyVerified: false,
};

/**
 * Simple beginner-friendly validation.
 * Returns an errors object — if it has any keys, the form is invalid.
 */
export function validateSearchForm(
  values: NewSearchFormValues
): NewSearchFormErrors {
  const errors: NewSearchFormErrors = {};

  if (!values.businessType) {
    errors.businessType = "Choose a business type.";
  }

  if (!values.country) {
    errors.country = "Choose a country.";
  }

  if (!values.state) {
    errors.state = "Choose a state.";
  }

  if (!values.city) {
    errors.city = "Choose a city.";
  }

  if (!values.radius || values.radius < 1) {
    errors.radius = "Radius must be at least 1 km.";
  }

  if (!values.maximumResults || values.maximumResults < 1) {
    errors.maximumResults = "Enter at least 1 result.";
  } else if (values.maximumResults > 500) {
    errors.maximumResults = "Maximum is 500 results.";
  }

  if (values.minimumRating < 0 || values.minimumRating > 5) {
    errors.minimumRating = "Rating must be between 0 and 5.";
  }

  // Has Website and No Website cannot both be on
  if (values.hasWebsite && values.noWebsite) {
    errors.websiteFilters = "Choose either Has Website or No Website, not both.";
  }

  // Poor website only makes sense when looking for businesses with websites
  if (values.onlyPoorWebsite && values.noWebsite) {
    errors.websiteFilters =
      "Only Poor Website cannot be combined with No Website.";
  }

  return errors;
}
