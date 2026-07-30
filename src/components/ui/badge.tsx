import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        pending: "border-zinc-500/40 bg-zinc-500/15 text-zinc-300",
        draft: "border-sky-500/40 bg-sky-500/15 text-sky-300",
        approved: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
        sending: "border-amber-500/40 bg-amber-500/15 text-amber-300",
        sent: "border-green-500/40 bg-green-500/15 text-green-300",
        failed: "border-red-500/40 bg-red-500/15 text-red-300",
        skipped: "border-orange-500/40 bg-orange-500/15 text-orange-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
