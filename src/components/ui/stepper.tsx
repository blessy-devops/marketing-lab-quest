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
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav className={cn("mb-8", className)} aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={cn(
              stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "",
              "relative"
            )}
          >
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div
                className={cn(
                  "h-0.5 w-full",
                  stepIdx < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            </div>
            <div
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full border-2",
                stepIdx < currentStep
                  ? "border-primary bg-primary"
                  : stepIdx === currentStep
                  ? "border-primary bg-background"
                  : "border-muted bg-background"
              )}
            >
              {stepIdx < currentStep ? (
                <Check className="h-4 w-4 text-primary-foreground" />
              ) : (
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    stepIdx === currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
            <div className="ml-4 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  stepIdx <= currentStep ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}