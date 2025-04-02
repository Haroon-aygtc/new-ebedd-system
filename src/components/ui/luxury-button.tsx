import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-navy-600 text-white hover:bg-navy-700 shadow-md hover:shadow-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-luxury-100 text-luxury-800 hover:bg-luxury-200",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gold: "bg-gold-400 text-luxury-900 hover:bg-gold-500 shadow-gold",
        emerald: "bg-emerald-500 text-white hover:bg-emerald-600",
        glass:
          "bg-white/70 backdrop-blur-md border border-white/20 text-luxury-900 hover:bg-white/80",
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        scale: "transform hover:scale-105 active:scale-95",
        lift: "transform hover:-translate-y-1",
        pulse: "hover:animate-pulse-soft",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "lift",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  withMotion?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      asChild = false,
      withMotion = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    if (withMotion) {
      return (
        <motion.button
          className={cn(
            buttonVariants({ variant, size, animation, className }),
          )}
          ref={ref as React.Ref<HTMLButtonElement>}
          whileHover={{
            y: -2,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
          whileTap={{ y: 0, boxShadow: "0 5px 15px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          {...props}
        />
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
