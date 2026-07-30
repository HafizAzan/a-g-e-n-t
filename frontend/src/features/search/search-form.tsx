"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Rocket } from "lucide-react";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  businessTypeOptions,
  countryOptions,
  getCitiesForState,
  getStatesForCountry,
} from "@/data/search-form-options";
import { FilterCheckbox } from "@/features/search/filter-checkbox";
import { SearchSummaryCard } from "@/features/search/search-summary-card";
import { useCreateSearch } from "@/hooks/queries";
import { getApiErrorMessage } from "@/api/axios";
import {
  defaultSearchFormValues,
  validateSearchForm,
} from "@/lib/validate-search-form";
import type {
  NewSearchFormErrors,
  NewSearchFormValues,
} from "@/types/new-search";

type SearchFormProps = {
  /** Optional prefill from Dashboard Quick Search (?q=) */
  initialQuery?: string;
};

/**
 * SearchForm — validate and POST /api/search (real API).
 */
export function SearchForm({ initialQuery }: SearchFormProps) {
  const router = useRouter();
  const createSearch = useCreateSearch();

  const startingValues = useMemo(() => {
    const values = { ...defaultSearchFormValues };

    if (!initialQuery) return values;

    const matchedType = businessTypeOptions.find(
      (option) => option.toLowerCase() === initialQuery.toLowerCase()
    );

    if (matchedType) {
      values.businessType = matchedType;
    }

    return values;
  }, [initialQuery]);

  const [values, setValues] = useState<NewSearchFormValues>(startingValues);
  const [errors, setErrors] = useState<NewSearchFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const states = getStatesForCountry(values.country);
  const cities = getCitiesForState(values.country, values.state);
  const isSubmitting = createSearch.isPending;

  function updateField<K extends keyof NewSearchFormValues>(
    key: K,
    value: NewSearchFormValues[K]
  ) {
    setValues((current) => {
      const next = { ...current, [key]: value };

      // Reset dependent location fields when parent changes
      if (key === "country") {
        next.state = "";
        next.city = "";
      }

      if (key === "state") {
        next.city = "";
      }

      // Mutual exclusion helpers for website presence filters
      if (key === "hasWebsite" && value === true) {
        next.noWebsite = false;
      }

      if (key === "noWebsite" && value === true) {
        next.hasWebsite = false;
        next.onlyPoorWebsite = false;
      }

      return next;
    });

    // Clear the error for the field being edited
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      if (key === "hasWebsite" || key === "noWebsite" || key === "onlyPoorWebsite") {
        delete next.websiteFilters;
      }
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors = validateSearchForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const result = await createSearch.mutateAsync(values);
      router.push(`/search/${result.searchId}/results`);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {submitError ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      {initialQuery && !values.businessType ? (
        <p className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
          From Quick Search: “{initialQuery}”. Pick a matching business type
          below (or choose freely).
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          {/* Target + location */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle>Target & location</CardTitle>
              <CardDescription>
                Tell the AI what kind of businesses to find and where.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Business Type"
                htmlFor="businessType"
                error={errors.businessType}
                className="sm:col-span-2"
              >
                <Select
                  value={values.businessType || undefined}
                  onValueChange={(value) => updateField("businessType", value)}
                >
                  <SelectTrigger
                    id="businessType"
                    className="h-10 w-full"
                    aria-invalid={Boolean(errors.businessType)}
                  >
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Country"
                htmlFor="country"
                error={errors.country}
              >
                <Select
                  value={values.country || undefined}
                  onValueChange={(value) => updateField("country", value)}
                >
                  <SelectTrigger
                    id="country"
                    className="h-10 w-full"
                    aria-invalid={Boolean(errors.country)}
                  >
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="State" htmlFor="state" error={errors.state}>
                <Select
                  value={values.state || undefined}
                  onValueChange={(value) => updateField("state", value)}
                  disabled={!values.country}
                >
                  <SelectTrigger
                    id="state"
                    className="h-10 w-full"
                    aria-invalid={Boolean(errors.state)}
                  >
                    <SelectValue
                      placeholder={
                        values.country ? "Select state" : "Select country first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="City" htmlFor="city" error={errors.city}>
                <Select
                  value={values.city || undefined}
                  onValueChange={(value) => updateField("city", value)}
                  disabled={!values.state}
                >
                  <SelectTrigger
                    id="city"
                    className="h-10 w-full"
                    aria-invalid={Boolean(errors.city)}
                  >
                    <SelectValue
                      placeholder={
                        values.state ? "Select city" : "Select state first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Radius (km)"
                htmlFor="radius"
                error={errors.radius}
                hint="How far from the city center to search."
              >
                <Input
                  id="radius"
                  type="number"
                  min={1}
                  max={200}
                  value={values.radius}
                  onChange={(event) =>
                    updateField("radius", Number(event.target.value) || 0)
                  }
                  aria-invalid={Boolean(errors.radius)}
                  className="h-10"
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Limits */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle>Result limits</CardTitle>
              <CardDescription>
                Control how many leads to return and the quality bar.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Maximum Results"
                htmlFor="maximumResults"
                error={errors.maximumResults}
                hint="Up to 500 for mock searches."
              >
                <Input
                  id="maximumResults"
                  type="number"
                  min={1}
                  max={500}
                  value={values.maximumResults}
                  onChange={(event) =>
                    updateField(
                      "maximumResults",
                      Number(event.target.value) || 0
                    )
                  }
                  aria-invalid={Boolean(errors.maximumResults)}
                  className="h-10"
                />
              </FormField>

              <FormField
                label="Minimum Rating"
                htmlFor="minimumRating"
                error={errors.minimumRating}
                hint="From 0.0 to 5.0 stars."
              >
                <Input
                  id="minimumRating"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={values.minimumRating}
                  onChange={(event) =>
                    updateField(
                      "minimumRating",
                      Number(event.target.value) || 0
                    )
                  }
                  aria-invalid={Boolean(errors.minimumRating)}
                  className="h-10"
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Website filters */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle>Website filters</CardTitle>
              <CardDescription>
                Narrow leads by website presence and quality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {errors.websiteFilters ? (
                <p className="text-xs text-destructive">
                  {errors.websiteFilters}
                </p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <FilterCheckbox
                  id="hasWebsite"
                  label="Has Website"
                  description="Only include businesses with a website."
                  checked={values.hasWebsite}
                  onCheckedChange={(checked) =>
                    updateField("hasWebsite", checked)
                  }
                />
                <FilterCheckbox
                  id="noWebsite"
                  label="No Website"
                  description="Only include businesses without a website."
                  checked={values.noWebsite}
                  onCheckedChange={(checked) =>
                    updateField("noWebsite", checked)
                  }
                />
                <FilterCheckbox
                  id="onlyPoorWebsite"
                  label="Only Poor Website"
                  description="Focus on weak or outdated sites (needs a website)."
                  checked={values.onlyPoorWebsite}
                  onCheckedChange={(checked) =>
                    updateField("onlyPoorWebsite", checked)
                  }
                />
                <FilterCheckbox
                  id="onlyVerified"
                  label="Only Verified"
                  description="Prefer verified business listings only."
                  checked={values.onlyVerified}
                  onCheckedChange={(checked) =>
                    updateField("onlyVerified", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky summary + submit on large screens */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <SearchSummaryCard values={values} />

          <Card className="border-border/50 bg-card/80">
            <CardContent className="flex flex-col gap-3 pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Starting…
                  </>
                ) : (
                  <>
                    <Rocket className="size-4" />
                    Start Search
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={isSubmitting}
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Mock submission — opens Search Progress with a fake run id.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
