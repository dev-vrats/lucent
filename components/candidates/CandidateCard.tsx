'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { Candidate, PIPELINE_STAGES, PipelineStage, getScoreColor } from '@/types';
import { ScoreRing } from './ScoreRing';
import { PipelineBadge } from '../ui/Badge';
import confetti from 'canvas-confetti';

interface CandidateCardProps {
  candidate: Candidate;
  jobId: string;
  rank?: number;
  onPipelineChange: (id: string, stage: PipelineStage) => void;
  onRetry?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export function CandidateCard({
  candidate,
  jobId,
  rank,
  onPipelineChange,
  onRetry,
  selected,
  onSelect,
}: CandidateCardProps) {
  const [scanning, setScanning] = useState(false);
  const [showStageMenu, setShowStageMenu] = useState(false);
  const prevStatus = useRef(candidate.status);
  const confettiFired = useRef(false);

  // Trigger scan animation when status becomes 'analyzed'
  useEffect(() => {
    if (prevStatus.current !== 'analyzed' && candidate.status === 'analyzed') {
      setScanning(true);
      setTimeout(() => setScanning(false), 1400);

      // Confetti for 90+ scores
      if (
        !confettiFired.current &&
        candidate.analysis?.overallMatchScore != null &&
        candidate.analysis.overallMatchScore >= 90
      ) {
        confettiFired.current = true;
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A4BF9D', '#EDF15F', '#0145F2', '#EAF3F0'],
        });
      }
    }
    prevStatus.current = candidate.status;
  }, [candidate.status, candidate.analysis?.overallMatchScore]);

  const score = candidate.analysis?.overallMatchScore ?? 0;
  const scoreColor = getScoreColor(score);
  const name = candidate.analysis?.candidateName || candidate.fileName.replace(/\.[^/.]+$/, '');
  const verdict = candidate.analysis?.oneLineVerdict;
  const skills = candidate.analysis?.extractedSkills?.slice(0, 4) ?? [];
  const requiredNotice = candidate.analysis?.gaps?.length ? candidate.analysis.gaps.length : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`relative glass-card overflow-hidden transition-shadow duration-200 hover:shadow-card-hover ${selected ? 'ring-2 ring-[#A4BF9D]/60' : ''}`}
    >
      {/* Scan-line sweep animation */}
      {scanning && (
        <div className="scan-overlay">
          <div className="scan-line" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Select checkbox */}
          {onSelect && (
            <button
              onClick={() => onSelect(candidate.id)}
              className="mt-1 w-5 h-5 rounded border border-[rgba(164,191,157,0.3)] flex items-center justify-center flex-shrink-0 hover:border-[#A4BF9D] transition-colors"
              aria-label={`Select ${name}`}
            >
              {selected && <div className="w-3 h-3 rounded-sm bg-[#A4BF9D]" />}
            </button>
          )}

          {/* Rank badge */}
          {rank != null && candidate.status === 'analyzed' && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${scoreColor}22`, color: scoreColor, border: `1px solid ${scoreColor}44` }}
            >
              {rank}
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-[#EAF3F0] truncate">{name}</h3>
                <p className="text-xs text-[#5E7A76] truncate mt-0.5">{candidate.fileName}</p>
              </div>

              {/* Score ring */}
              {candidate.status === 'analyzed' && (
                <ScoreRing score={score} size={52} strokeWidth={4} />
              )}

              {/* Analyzing spinner */}
              {candidate.status === 'analyzing' && (
                <div className="flex items-center gap-2 text-[#E8C468] text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing…</span>
                </div>
              )}

              {/* Uploading */}
              {candidate.status === 'uploading' && (
                <div className="flex items-center gap-2 text-[#5E7A76] text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading…</span>
                </div>
              )}

              {/* Error */}
              {candidate.status === 'error' && (
                <button
                  onClick={() => onRetry?.(candidate.id)}
                  className="flex items-center gap-1.5 text-[#D97878] text-xs hover:text-[#e89090] transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Retry</span>
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Verdict */}
            {verdict && (
              <p className="text-sm text-[#93AFA8] mt-2 line-clamp-2">{verdict}</p>
            )}

            {/* Skills chips */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-full text-xs bg-[rgba(164,191,157,0.08)] text-[#A4BF9D] border border-[rgba(164,191,157,0.14)]"
                  >
                    {skill}
                  </span>
                ))}
                {(candidate.analysis?.extractedSkills?.length ?? 0) > 4 && (
                  <span className="px-2 py-0.5 rounded-full text-xs text-[#5E7A76]">
                    +{(candidate.analysis?.extractedSkills?.length ?? 0) - 4} more
                  </span>
                )}
              </div>
            )}

            {/* Footer row */}
            <div className="flex items-center justify-between mt-4">
              {/* Pipeline badge / selector */}
              <div className="relative">
                <button
                  onClick={() => setShowStageMenu((v) => !v)}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A4BF9D]"
                >
                  <PipelineBadge stage={candidate.pipelineStage} onClick={() => {}} />
                </button>

                <AnimatePresence>
                  {showStageMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute left-0 top-8 z-20 glass-card p-1.5 min-w-[140px] shadow-card"
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <button
                          key={s.value}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-[rgba(164,191,157,0.08)] transition-colors"
                          style={{ color: s.color }}
                          onClick={() => {
                            onPipelineChange(candidate.id, s.value);
                            setShowStageMenu(false);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View profile link */}
              {candidate.status === 'analyzed' && (
                <Link
                  href={`/jobs/${jobId}/candidates/${candidate.id}`}
                  className="flex items-center gap-1 text-xs text-[#5E7A76] hover:text-[#A4BF9D] transition-colors"
                >
                  Full profile <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
