"use client";

import { CheckCircle2, Lock } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StepDefinition, WorkflowStep } from "@/types/zsprite";

type StepSidebarProps = {
  steps: Array<
    StepDefinition & {
      disabled?: boolean;
      complete?: boolean;
    }
  >;
  activeStep: WorkflowStep;
  onStepChange: (step: WorkflowStep) => void;
  panelTitle: string;
  panelDescription: string;
  panelContent: ReactNode;
  apiKeysPanel: ReactNode;
};

export function StepSidebar({
  steps,
  activeStep,
  onStepChange,
  panelTitle,
  panelDescription,
  panelContent,
  apiKeysPanel,
}: StepSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle>Workflow</CardTitle>
          <CardDescription>Move step by step without flooding the screen with controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
                step.id === activeStep
                  ? "border-[color:var(--accent)] bg-white/8"
                  : "border-white/8 bg-white/4 hover:border-white/14 hover:bg-white/6",
                step.disabled ? "cursor-not-allowed opacity-45" : "",
              )}
              disabled={step.disabled}
              onClick={() => onStepChange(step.id)}
            >
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-950/70 text-xs font-semibold text-slate-300">
                {step.complete ? <CheckCircle2 className="size-4 text-[color:var(--accent)]" /> : index + 1}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <span>{step.label}</span>
                  {step.disabled ? <Lock className="size-3.5 text-slate-500" /> : null}
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-400">{step.description}</div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="min-h-0 flex-1">
        <CardHeader className="pb-3">
          <CardTitle>{panelTitle}</CardTitle>
          <CardDescription>{panelDescription}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto">{panelContent}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Local-only storage for the tools you use to generate source videos.</CardDescription>
        </CardHeader>
        <CardContent>{apiKeysPanel}</CardContent>
      </Card>
    </div>
  );
}
