import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
import { useUser, UserPermissions } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RestrictedButtonProps extends ButtonProps {
  permission: keyof UserPermissions;
  tooltipMessage?: string;
  showLockIcon?: boolean;
  shakeOnRestricted?: boolean;
}

export const RestrictedButton = React.forwardRef<HTMLButtonElement, RestrictedButtonProps>(
  ({ 
    permission, 
    tooltipMessage, 
    showLockIcon = true, 
    shakeOnRestricted = true,
    children, 
    onClick, 
    className,
    disabled,
    ...props 
  }, ref) => {
    const { permissions } = useUser();
    const { toast } = useToast();
    const [shake, setShake] = React.useState(false);
    
    const hasPermission = permissions[permission];
    const isRestricted = !hasPermission && !disabled;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!hasPermission) {
        e.preventDefault();
        
        if (shakeOnRestricted) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
        }

        toast({
          title: "Acesso Restrito",
          description: tooltipMessage || "Você não tem permissão para realizar esta ação.",
          variant: "destructive",
        });
        return;
      }
      
      onClick?.(e);
    };

    const button = (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          isRestricted && "opacity-60 cursor-not-allowed",
          shake && "animate-[shake_0.5s_ease-in-out]",
          className
        )}
        {...props}
      >
        {isRestricted && showLockIcon && !props.asChild && (
          <Lock className="w-4 h-4 mr-2" />
        )}
        {children}
      </Button>
    );

    if (isRestricted && tooltipMessage) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);

RestrictedButton.displayName = "RestrictedButton";