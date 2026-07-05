'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, LayoutList, Columns, Search, SlidersHorizontal,
  Download, CheckSquare, Square, X, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useCandidates } from '@/hooks/useCandidates';
import { Button } from '@/components/ui/Button';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { CandidateCardSkeleton } from '@/components/ui/Skeleton';
import { DropZone } from '@/components/candidates/DropZone';
import { KanbanBoard } from '@/components/candidates/KanbanBoard';
import type { Job, Candidate, PipelineStage } from '@/types';
import { PIPELINE_STAGES } from '@/types';
import toast from 'react-hot-toast';

type ViewMode = 'list' | 'kanban';

export default function JobPage() {
  const params = useParams<{ jobId: string }>();
  const jobId  = params.jobId;
  const { user } = useAuth();

  const [job, setJob]           = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch]     = useState('');
  const [scoreFilter, setScoreFilter] = useState<[number, number]>([0, 100]);
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const { candidates, loading: candidatesLoading, updateCandidatePipeline } = useCandidates(jobId);

  // Subscribe to job doc
  useEffect(() => {
    if (!jobId) return;
    const unsub = onSnapshot(doc(db, 'jobs', jobId), (snap) => {
      if (snap.exists()) setJob({ id: snap.id, ...snap.data() } as Job);
      setJobLoading(false);
    });
    return unsub;
  }, [jobId]);

  // Filter & search candidates
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const name  = (c.analysis?.candidateName ?? c.fileName).toLowerCase();
      const score = c.analysis?.overallMatchScore ?? 0;
      const stage = c.pipelineStage;
      if (search && !name.includes(search.toLowerCase())) return false;
      if (score < scoreFilter[0] || score > scoreFilter[1]) return false;
      if (stageFilter !== 'all' && stage !== stageFilter) return false;
      return true;
    });
  }, [candidates, search, scoreFilter, stageFilter]);

  const handlePipelineChange = async (id: string, stage: PipelineStage) => {
    await updateCandidatePipeline(id, stage);
    toast.success(`Moved to ${stage}`);
  };

  const handleRetry = async (candidateId: string) => {
    const c = candidates.find((x) => x.id === candidateId);
    if (!c || !user || !job) return;
    try {
      await updateDoc(doc(db, 'jobs', jobId, 'candidates', candidateId), { status: 'analyzing' });
      const idToken = await user.getIdToken();
      await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          jobId, candidateId, fileName: c.fileName, resumeStoragePath: c.resumeStoragePath,
          jobTitle: job.title, jobDescription: job.description,
          requiredSkills: job.requiredSkills, experienceLevel: job.experienceLevel,
        }),
      });
    } catch { toast.error('Retry failed.'); }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkPipelineChange = async (stage: PipelineStage) => {
    await Promise.all([...selected].map((id) => updateCandidatePipeline(id, stage)));
    toast.success(`${selected.size} candidate${selected.size !== 1 ? 's' : ''} moved to ${stage}`);
    setSelected(new Set());
  };

  const exportCSV = () => {
    const analyzed = candidates.filter((c) => c.analysis);
    const header   = 'Name,Email,Score,Stage,Verdict,Skills';
    const rows     = analyzed.map((c) => [
      c.analysis!.candidateName,
      c.analysis!.email ?? '',
      c.analysis!.overallMatchScore,
      c.pipelineStage,
      `"${c.analysis!.oneLineVerdict.replace(/"/g, '""')}"`,
      `"${c.analysis!.extractedSkills.join(', ')}"`,
    ].join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${job?.title ?? 'candidates'}-shortlist.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const toggleJobStatus = async () => {
    if (!job) return;
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    await updateDoc(doc(db, 'jobs', jobId), { status: newStatus });
    toast.success(newStatus === 'open' ? 'Job reopened.' : 'Job closed.');
  };

  if (jobLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="h-8 w-64 skeleton rounded-lg" />
        <div className="h-32 skeleton rounded-2xl" />
      </div>
    );
  }

  if (!job) return (
    <div className="text-center py-20">
      <p className="text-[#5E7A76]">Job not found.</p>
      <Link href="/dashboard"><Button variant="ghost" className="mt-4">Back to dashboard</Button></Link>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#5E7A76] hover:text-[#93AFA8] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      {/* Job header */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-[#EAF3F0]">{job.title}</h1>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${job.status === 'open' ? 'bg-[rgba(164,191,157,0.12)] text-[#A4BF9D]' : 'bg-[rgba(94,122,118,0.12)] text-[#5E7A76]'}`}>
                {job.status}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-[#5E7A76]">
              {job.department && <span>{job.department}</span>}
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{job.candidateCount} candidate{job.candidateCount !== 1 ? 's' : ''}</span>
              {job.avgScore != null && <span className="font-mono">{job.avgScore} avg score</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Button variant={job.status === 'open' ? 'secondary' : 'outline'} size="sm" onClick={toggleJobStatus}>
              {job.status === 'open' ? 'Close job' : 'Reopen job'}
            </Button>
          </div>
        </div>

        {/* Required skills */}
        {job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {job.requiredSkills.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-[rgba(164,191,157,0.08)] text-[#A4BF9D] border border-[rgba(164,191,157,0.14)]">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Upload zone */}
      {job.status === 'open' && user && (
        <div className="glass-card p-6">
          <h2 className="font-semibold text-[#EAF3F0] mb-4">Upload resumes</h2>
          <DropZone
            jobId={jobId}
            user={user}
            jobTitle={job.title}
            jobDescription={job.description}
            requiredSkills={job.requiredSkills}
            experienceLevel={job.experienceLevel}
          />
        </div>
      )}

      {/* Candidates section */}
      <div>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E7A76]" />
            <input
              type="search"
              placeholder="Search candidates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-[rgba(15,46,54,0.8)] border border-[rgba(164,191,157,0.14)] text-[#EAF3F0] placeholder:text-[#5E7A76] focus:outline-none focus:ring-2 focus:ring-[#A4BF9D]/30"
            />
          </div>

          {/* Stage filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as PipelineStage | 'all')}
            className="px-3 py-2 rounded-xl text-sm bg-[rgba(15,46,54,0.8)] border border-[rgba(164,191,157,0.14)] text-[#93AFA8] focus:outline-none"
          >
            <option value="all">All stages</option>
            {PIPELINE_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* View toggle */}
          <div className="flex gap-1 p-1 bg-[rgba(164,191,157,0.06)] rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#0F2E36] text-[#EAF3F0]' : 'text-[#5E7A76]'}`}
              aria-label="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-[#0F2E36] text-[#EAF3F0]' : 'text-[#5E7A76]'}`}
              aria-label="Kanban view"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk action bar */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 glass-card p-3 mb-3"
            >
              <span className="text-sm text-[#93AFA8]">{selected.size} selected</span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={() => bulkPipelineChange('shortlisted')}>Shortlist</Button>
                <Button size="sm" variant="destructive" onClick={() => bulkPipelineChange('rejected')}>Reject</Button>
                <button onClick={() => setSelected(new Set())} className="text-[#5E7A76] hover:text-[#EAF3F0]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Candidate list / kanban */}
        {viewMode === 'list' ? (
          candidatesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <CandidateCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <Users className="w-10 h-10 text-[#5E7A76] mx-auto mb-3" />
              <p className="font-semibold text-[#EAF3F0]">
                {candidates.length === 0 ? 'No candidates yet' : 'No results'}
              </p>
              <p className="text-sm text-[#5E7A76] mt-1">
                {candidates.length === 0
                  ? 'Drop resumes above to get your first ranked shortlist.'
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {filtered.map((c, i) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    jobId={jobId}
                    rank={c.status === 'analyzed' ? i + 1 : undefined}
                    onPipelineChange={handlePipelineChange}
                    onRetry={handleRetry}
                    selected={selected.has(c.id)}
                    onSelect={toggleSelect}
                  />
                ))}
              </div>
            </AnimatePresence>
          )
        ) : (
          <KanbanBoard
            candidates={candidates}
            jobId={jobId}
            onPipelineChange={handlePipelineChange}
          />
        )}
      </div>

      <p className="text-xs text-[#5E7A76] text-center">AI scoring is decision support — you make the call.</p>
    </div>
  );
}
