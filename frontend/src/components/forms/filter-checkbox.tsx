"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { checkboxRow } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type FilterCheckboxProps = {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
};

/**
 * FilterCheckbox
 * Purpose: premium checkbox row with label + helper text.
 * Used by New Search filters and Settings CSV/defaults.
 */
export function FilterCheckbox({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  className,
}: FilterCheckboxProps) {
  return (
    <div
      className={cn(
        checkboxRow,
        checked && "border-border bg-secondary/50",
        className
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
        aria-describedby={`${id}-hint`}
      />
      <div className="space-y-1">
        <label
          htmlFor={id}
          className="cursor-pointer text-sm leading-none font-medium"
        >
          {label}
        </label>
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
