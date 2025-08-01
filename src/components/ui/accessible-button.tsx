import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string;
  ariaDescription?: string;
  shortcut?: string;
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    ariaLabel, 
    ariaDescription, 
    shortcut,
    className,
    onKeyDown,
    ...props 
  }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      // Handle Enter and Space keys
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.currentTarget.click();
      }
      onKeyDown?.(e);
    };

    return (
      <Button
        ref={ref}
        aria-label={ariaLabel}
        aria-describedby={ariaDescription}
        title={shortcut ? `${ariaLabel || children} (${shortcut})` : ariaLabel}
        className={cn(
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "focus-visible:outline-none",
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        {shortcut && (
          <span className="sr-only">Atalho: {shortcut}</span>
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

export { AccessibleButton };