'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export type LeadFormValues = {
  prompt: string;
  country: string;
  city: string;
  limit: number;
};

type LeadFormProps = {
  values: LeadFormValues;
  loading: boolean;
  onChange: (values: LeadFormValues) => void;
  onSubmit: () => void;
};

export function LeadForm({ values, loading, onChange, onSubmit }: LeadFormProps) {
  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          value={values.prompt}
          onChange={(event) => onChange({ ...values, prompt: event.target.value })}
          placeholder="Find gyms in New York that may need a new website."
          className="min-h-37.5 resize-y text-base"
          required
        />
        <p className="text-xs text-muted-foreground">
          On generate, the app first loads every file from{' '}
          <code className="text-foreground">src/prompts/</code>, then sends your request to Cursor.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={values.country}
            onChange={(event) => onChange({ ...values, country: event.target.value })}
            placeholder="United States"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={values.city}
            onChange={(event) => onChange({ ...values, city: event.target.value })}
            placeholder="New York"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="limit">Limit</Label>
          <Input
            id="limit"
            type="number"
            min={1}
            max={50}
            value={values.limit}
            onChange={(event) =>
              onChange({
                ...values,
                limit: Number(event.target.value) || 1,
              })
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Reading prompts & generating...
            </>
          ) : (
            'Generate Leads'
          )}
        </Button>
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading markdown rules, then starting AI research.
          </p>
        ) : null}
      </div>
    </form>
  );
}
