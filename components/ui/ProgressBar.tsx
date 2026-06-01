import { STEPS } from '../../constants';
import type { StepId } from '../../types';

interface ProgressBarProps {
  currentStep: StepId;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const percent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-normal text-slate-500">
        <span>Progress</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-amber transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
