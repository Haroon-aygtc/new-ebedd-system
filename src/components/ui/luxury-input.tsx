import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  withMotion?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, withMotion = false, ...props }, ref) => {
    const inputClass = cn(
      "flex h-12 w-full rounded-lg border border-luxury-200 bg-luxury-50 px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 focus-visible:border-navy-300 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
      className,
    );

    if (withMotion) {
      return (
        <motion.input
          type={type}
          className={inputClass}
          ref={ref as React.Ref<HTMLInputElement>}
          whileFocus={{
            scale: 1.01,
            boxShadow: "0 0 0 3px rgba(65, 121, 208, 0.1)",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          {...props}
        />
      );
    }

    return <input type={type} className={inputClass} ref={ref} {...props} />;
  },
);
Input.displayName = "Input";

export { Input };
