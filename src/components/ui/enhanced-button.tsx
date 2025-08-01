import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  tooltip?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  icon?: React.ReactNode;
  animateOnHover?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    children, 
    loading, 
    tooltip, 
    tooltipSide = "top", 
    icon, 
    animateOnHover = true,
    className,
    disabled,
    ...props 
  }, ref) => {
    const button = (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          animateOnHover && "transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95",
          loading && "cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };