import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "text-foreground border border-input",
        gold: "bg-gold-100 text-gold-800",
        navy: "bg-navy-100 text-navy-800",
        emerald: "bg-emerald-100 text-emerald-800",
        luxury: "bg-luxury-100 text-luxury-800",
        glass:
          "bg-white/70 backdrop-blur-md border border-white/20 text-luxury-900",
      },
      animation: {
        none: "",
        pulse: "animate-pulse-soft",
        shimmer:
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
      animation: "none",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, animation, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, animation }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
