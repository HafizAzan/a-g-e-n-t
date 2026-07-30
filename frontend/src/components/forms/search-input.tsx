"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
  inputClassName?: string;
};

/**
 * SearchInput
 * Purpose: text field with a leading search icon (Quick Search + Results).
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  id,
  className,
  inputClassName,
  "aria-label": ariaLabel = "Search",
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn("h-10 pl-9", inputClassName)}
      />
    </div>
  );
}
