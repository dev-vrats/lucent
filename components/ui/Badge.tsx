'use client';

import { PipelineStage, PIPELINE_STAGES } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
      style={color ? { backgroundColor: `${color}22`, color, border: `1px solid ${color}44` } : {}}
    >
      {children}
    </span>
  );
}

interface PipelineBadgeProps {
  stage: PipelineStage;
  onClick?: () => void;
}

export function PipelineBadge({ stage, onClick }: PipelineBadgeProps) {
  const stageInfo = PIPELINE_STAGES.find((s) => s.value === stage)!;
  return (
    <Badge
      color={stageInfo.color}
      className={onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    >
      {stageInfo.label}
    </Badge>
  );
}

interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const color = score >= 80 ? '#A4BF9D' : score >= 50 ? '#E8C468' : '#D97878';
  return (
    <Badge color={color}>
      <span className="font-mono font-semibold">{score}</span>
    </Badge>
  );
}
