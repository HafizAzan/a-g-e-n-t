import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * FormField
 * Purpose: label + control + hint/error with basic a11y wiring.
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  const hintId = `${htmlFor}-hint`;
  const errorId = `${htmlFor}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>

      {/*
        Clone is avoided on purpose (beginner-friendly).
        Parents should pass aria-invalid / aria-describedby on the control
        using the same ids when they have direct access.
        We still expose ids here for easy wiring.
      */}
      <div
        data-describedby={describedBy}
        // Helps screen readers when the child forwards attributes via form libraries later
      >
        {children}
      </div>

      {error ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Ids helpers so parents can wire aria-describedby easily */
export function formFieldHintId(htmlFor: string) {
  return `${htmlFor}-hint`;
}

export function formFieldErrorId(htmlFor: string) {
  return `${htmlFor}-error`;
}
