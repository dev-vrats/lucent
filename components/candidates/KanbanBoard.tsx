'use client';

import { DragEvent, useState } from 'react';
import { motion } from 'framer-motion';
import type { Candidate, PipelineStage } from '@/types';
import { PIPELINE_STAGES } from '@/types';
import { ScoreRing } from './ScoreRing';
import Link from 'next/link';

interface KanbanBoardProps {
  candidates: Candidate[];
  jobId: string;
  onPipelineChange: (id: string, stage: PipelineStage) => void;
}

export function KanbanBoard({ candidates, jobId, onPipelineChange }: KanbanBoardProps) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent, candidateId: string) => {
    setDragging(candidateId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    if (dragging) {
      onPipelineChange(dragging, stage);
      setDragging(null);
      setDragOver(null);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
      {PIPELINE_STAGES.map((stage) => {
        const stageCandidates = candidates.filter((c) => c.pipelineStage === stage.value);
        const isOver = dragOver === stage.value;

        return (
          <div
            key={stage.value}
            className="flex-shrink-0 w-60"
            onDragOver={(e) => { e.preventDefault(); setDragOver(stage.value); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, stage.value as PipelineStage)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-sm font-medium text-[#93AFA8]">{stage.label}</span>
              </div>
              <span className="text-xs text-[#5E7A76] font-mono">{stageCandidates.length}</span>
            </div>

            {/* Drop zone */}
            <div
              className={`min-h-[200px] rounded-2xl p-2 space-y-2 transition-all duration-150 ${
                isOver
                  ? 'bg-[rgba(164,191,157,0.08)] border border-dashed border-[rgba(164,191,157,0.3)]'
                  : 'bg-[rgba(15,46,54,0.3)]'
              }`}
            >
              {stageCandidates.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  draggable
                  onDragStart={(e: any) => handleDragStart(e, c.id)}
                  onDragEnd={() => setDragging(null)}
                  className={`glass-card p-3 cursor-grab active:cursor-grabbing transition-opacity ${
                    dragging === c.id ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {c.analysis && (
                      <ScoreRing score={c.analysis.overallMatchScore} size={32} strokeWidth={3} showLabel={false} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#EAF3F0] truncate">
                        {c.analysis?.candidateName ?? c.fileName.replace(/\.[^/.]+$/, '')}
                      </p>
                      {c.analysis && (
                        <p className="font-mono text-xs" style={{
                          color: c.analysis.overallMatchScore >= 80 ? '#A4BF9D' : c.analysis.overallMatchScore >= 50 ? '#E8C468' : '#D97878'
                        }}>
                          {c.analysis.overallMatchScore}
                        </p>
                      )}
                    </div>
                  </div>
                  {c.analysis?.oneLineVerdict && (
                    <p className="text-xs text-[#5E7A76] line-clamp-2">{c.analysis.oneLineVerdict}</p>
                  )}
                  {c.analysis && (
                    <Link
                      href={`/jobs/${jobId}/candidates/${c.id}`}
                      className="text-xs text-[#A4BF9D] hover:underline mt-1.5 block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View profile →
                    </Link>
                  )}
                </motion.div>
              ))}

              {stageCandidates.length === 0 && (
                <div className="flex items-center justify-center h-20 text-xs text-[#5E7A76]">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
