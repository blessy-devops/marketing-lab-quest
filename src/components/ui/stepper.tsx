import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (stepIndex: number) => void;
  canNavigateToStep?: (stepIndex: number) => boolean;
}

export function Stepper({ 
  steps, 
  currentStep, 
  className,
  orientation = 'horizontal',
  onStepClick,
  canNavigateToStep
}: StepperProps) {
  const isHorizontal = orientation === 'horizontal';
  
  return (
    <nav className={cn(isHorizontal ? "mb-8" : "", className)} aria-label="Progress">
      <ol className={cn(
        isHorizontal ? "flex items-center" : "space-y-4"
      )}>
        {steps.map((step, stepIdx) => {
          const isClickable = onStepClick && canNavigateToStep?.(stepIdx);
          const isCompleted = stepIdx < currentStep;
          const isCurrent = stepIdx === currentStep;
          
          return (
            <li
              key={step.id}
              className={cn(
                isHorizontal && stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "",
                "relative"
              )}
            >
              {/* Connection line */}
              {isHorizontal ? (
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div
                    className={cn(
                      "h-0.5 w-full",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                </div>
              ) : (
                stepIdx !== steps.length - 1 && (
                  <div 
                    className="absolute left-4 top-8 w-0.5 h-4 -mt-2"
                    style={{ height: 'calc(100% + 0.5rem)' }}
                  >
                    <div
                      className={cn(
                        "w-full h-full",
                        isCompleted ? "bg-primary" : "bg-muted"
                      )}
                    />
                  </div>
                )
              )}
              
              {/* Step content */}
              <div 
                className={cn(
                  "flex items-start gap-3",
                  isClickable && "cursor-pointer hover:opacity-80 transition-opacity"
                )}
                onClick={() => isClickable && onStepClick(stepIdx)}
              >
                {/* Step indicator */}
                <div
                  className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-full border-2 flex-shrink-0",
                    isCompleted
                      ? "border-primary bg-primary"
                      : isCurrent
                      ? "border-primary bg-background"
                      : "border-muted bg-background"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        isCurrent ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
                
                {/* Step text */}
                <div className={cn("min-w-0", isHorizontal ? "ml-4" : "")}>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      stepIdx <= currentStep ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}