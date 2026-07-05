'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase, Users, TrendingUp, Plus, ArrowRight,
  Star, BookOpen, Clock,
} from 'lucide-react';
import { BentoGrid, BentoCell } from '@/components/bento/BentoGrid';
import { Button } from '@/components/ui/Button';
import { ScoreRing } from '@/components/candidates/ScoreRing';
import { PipelineBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import type { Candidate, Job } from '@/types';
import {
  collection, query, collectionGroup, where, onSnapshot, orderBy, limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Animated count-up number
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || target === 0) { setVal(target); return; }
    started.current = true;
    const duration = 1000;
    const steps = 40;
    const step = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{val}{suffix}</>;
}

const TRIVIA = [
  "Leonardo da Vinci's 1482 letter to the Duke of Milan pitching his engineering skills is one of history's earliest known 'resumes' — painting was almost an afterthought in it.",
  "The word résumé comes from the French résumer — 'to summarize.'",
  "Many hiring studies suggest a first resume scan often takes well under a minute — part of why clear structure matters so much.",
  "The cover letter predates the résumé by centuries — a written letter of introduction was once the only way to apply for skilled work.",
  "LinkedIn launched in 2003 out of a founder's living room.",
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs(user);
  const [topCandidate, setTopCandidate]   = useState<(Candidate & { jobTitle?: string }) | null>(null);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [triviaIndex, setTriviaIndex]     = useState(0);
  const [recentJobs, setRecentJobs]       = useState<Job[]>([]);

  // Rotate trivia
  useEffect(() => {
    const t = setInterval(() => setTriviaIndex((i) => (i + 1) % TRIVIA.length), 8000);
    return () => clearInterval(t);
  }, []);

  // Aggregate stats from jobs
  useEffect(() => {
    if (!jobs.length) return;
    setRecentJobs(jobs.slice(0, 5));

    // Count total candidates from job.candidateCount
    const total = jobs.reduce((s, j) => s + (j.candidateCount || 0), 0);
    setTotalCandidates(total);
  }, [jobs]);

  // Find top candidate across all jobs
  useEffect(() => {
    if (!user || !jobs.length) return;
    let best: (Candidate & { jobTitle?: string }) | null = null;
    let cancelled = false;

    jobs.forEach((job) => {
      const q = query(
        collection(db, 'jobs', job.id, 'candidates'),
        where('status', '==', 'analyzed'),
        orderBy('analysis.overallMatchScore', 'desc'),
        limit(1)
      );
      const unsub = onSnapshot(q, (snap) => {
        if (cancelled || snap.empty) return;
        const c = { id: snap.docs[0].id, ...snap.docs[0].data(), jobTitle: job.title } as Candidate & { jobTitle?: string };
        if (!best || (c.analysis?.overallMatchScore ?? 0) > (best.analysis?.overallMatchScore ?? 0)) {
          best = c;
          setTopCandidate({ ...best });
        }
      });
    });

    return () => { cancelled = true; };
  }, [user, jobs]);

  const openJobs  = jobs.filter((j) => j.status === 'open').length;
  const avgScore  = jobs.length
    ? Math.round(jobs.filter((j) => j.avgScore != null).reduce((s, j) => s + (j.avgScore ?? 0), 0) /
      Math.max(1, jobs.filter((j) => j.avgScore != null).length))
    : 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#EAF3F0]">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.displayName?.split(' ')[0] || 'there'}.
          </h1>
          <p className="text-[#5E7A76] mt-1">Here's your recruiting overview.</p>
        </div>
        <Link href="/jobs/new">
          <Button><Plus className="w-4 h-4" /> New Job</Button>
        </Link>
      </div>

      {/* Bento grid */}
      <BentoGrid>
        {/* Active Jobs — col 1 */}
        <BentoCell delay={0.05}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#5E7A76] font-medium">Active Jobs</p>
              <p className="font-display text-4xl font-bold text-[#EAF3F0] mt-1">
                {jobsLoading ? '–' : <CountUp target={openJobs} />}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[rgba(164,191,157,0.1)]">
              <Briefcase className="w-5 h-5 text-[#A4BF9D]" />
            </div>
          </div>
          <p className="text-xs text-[#5E7A76] mt-3">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} total
          </p>
        </BentoCell>

        {/* Total Candidates — col 1 */}
        <BentoCell delay={0.1}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#5E7A76] font-medium">Candidates Screened</p>
              <p className="font-display text-4xl font-bold text-[#EAF3F0] mt-1">
                {jobsLoading ? '–' : <CountUp target={totalCandidates} />}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[rgba(164,191,157,0.1)]">
              <Users className="w-5 h-5 text-[#A4BF9D]" />
            </div>
          </div>
          <p className="text-xs text-[#5E7A76] mt-3">Across all open roles</p>
        </BentoCell>

        {/* Avg Score — col 1 */}
        <BentoCell delay={0.15}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#5E7A76] font-medium">Avg Match Score</p>
              <p className="font-mono text-4xl font-bold mt-1" style={{
                color: avgScore >= 80 ? '#A4BF9D' : avgScore >= 50 ? '#E8C468' : '#5E7A76'
              }}>
                {jobsLoading ? '–' : avgScore > 0 ? <CountUp target={avgScore} /> : '—'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[rgba(164,191,157,0.1)]">
              <TrendingUp className="w-5 h-5 text-[#A4BF9D]" />
            </div>
          </div>
          <p className="text-xs text-[#5E7A76] mt-3">Platform-wide average</p>
        </BentoCell>

        {/* Top Candidate Spotlight — col 1, row 2 */}
        <BentoCell colSpan={1} rowSpan={2} delay={0.2} className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-[#E8C468]" />
            <p className="text-sm font-medium text-[#93AFA8]">Top Candidate</p>
          </div>
          {topCandidate?.analysis ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
              <ScoreRing score={topCandidate.analysis.overallMatchScore} size={96} strokeWidth={7} />
              <div>
                <p className="font-display text-lg font-semibold text-[#EAF3F0]">
                  {topCandidate.analysis.candidateName}
                </p>
                <p className="text-xs text-[#5E7A76] mt-0.5">{topCandidate.jobTitle}</p>
                <p className="text-sm text-[#93AFA8] mt-2 italic">
                  "{topCandidate.analysis.oneLineVerdict}"
                </p>
              </div>
              <PipelineBadge stage={topCandidate.pipelineStage} />
              <Link
                href={`/jobs/${topCandidate.jobId}/candidates/${topCandidate.id}`}
                className="text-xs text-[#A4BF9D] hover:underline flex items-center gap-1"
              >
                View full profile <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(164,191,157,0.08)] flex items-center justify-center">
                <Star className="w-6 h-6 text-[#5E7A76]" />
              </div>
              <p className="text-sm text-[#5E7A76]">
                Upload resumes to see your top candidate here.
              </p>
            </div>
          )}
        </BentoCell>

        {/* Recent Jobs — col 2 */}
        <BentoCell colSpan={2} delay={0.25}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#93AFA8] flex items-center gap-2">
              <Clock className="w-4 h-4" /> Recent Jobs
            </p>
            <Link href="/jobs" className="text-xs text-[#A4BF9D] hover:underline">View all</Link>
          </div>
          {jobsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-[#5E7A76]">No jobs yet.</p>
              <Link href="/jobs/new">
                <Button variant="ghost" size="sm" className="mt-2">Create your first job</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[rgba(164,191,157,0.06)] transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#EAF3F0] truncate group-hover:text-[#A4BF9D] transition-colors">{job.title}</p>
                    <p className="text-xs text-[#5E7A76]">{job.candidateCount} candidate{job.candidateCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {job.avgScore != null && (
                      <span className="font-mono text-xs text-[#93AFA8]">{job.avgScore} avg</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${job.status === 'open' ? 'bg-[rgba(164,191,157,0.12)] text-[#A4BF9D]' : 'bg-[rgba(94,122,118,0.12)] text-[#5E7A76]'}`}>
                      {job.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </BentoCell>

        {/* Did You Know — col 2 */}
        <BentoCell colSpan={2} delay={0.3}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[rgba(237,241,95,0.1)] flex-shrink-0">
              <BookOpen className="w-4 h-4 text-[#EDF15F]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#EDF15F] mb-1.5">Did you know?</p>
              <motion.p
                key={triviaIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-sm text-[#93AFA8] leading-relaxed"
              >
                {TRIVIA[triviaIndex]}
              </motion.p>
            </div>
          </div>
        </BentoCell>
      </BentoGrid>

      {/* AI notice */}
      <p className="text-xs text-[#5E7A76] text-center">
        AI scoring is decision support — you make the call.
      </p>
    </div>
  );
}
