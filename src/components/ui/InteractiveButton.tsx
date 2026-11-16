import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type InteractiveButtonMotion = "press" | "toggle" | "card" | "none";

export type InteractiveButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  motion?: InteractiveButtonMotion;
};

/**
 * Shared primitive for in-page controls such as toggles, carousel navigation,
 * dialog triggers and form submission. CTA links continue to use Button.astro.
 */
export const InteractiveButton = forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ type = "button", motion = "press", className, ...props }, ref) => (
    <button
      {...props}
      ref={ref}
      type={type}
      data-motion={motion}
      className={cn(
        "interactive-button focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed",
        className,
      )}
    />
  ),
);

InteractiveButton.displayName = "InteractiveButton";
