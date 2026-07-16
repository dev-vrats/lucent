'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import { CommandPalette } from '@/components/nav/CommandPalette';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import type { Job } from '@/types';

export default function JobsListPage() {
  const { user } = useAuth();
  const { jobs, loading } = useJobs(user);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Global Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const openJobs  = jobs.filter((j) => j.status === 'open');
  const closedJobs = jobs.filter((j) => j.status === 'closed');

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#EAF3F0]">Jobs</h1>
          <p className="text-[#5E7A76] mt-1 text-sm sm:text-base">
            {loading ? '…' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={() => setCmdOpen(true)} className="flex-1 sm:flex-none justify-center">
            <span className="text-xs font-mono">⌘K</span> Search
          </Button>
          <Link href="/jobs/new" className="flex-1 sm:flex-none">
            <Button className="w-full justify-center"><Plus className="w-4 h-4" /> New Job</Button>
          </Link>
        </div>
      </div>

      {/* Jobs grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="w-12 h-12 text-[#5E7A76] mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-[#EAF3F0]">No jobs yet</h2>
          <p className="text-sm text-[#5E7A76] mt-2 mb-6">Create your first job to start screening candidates.</p>
          <Link href="/jobs/new">
            <Button><Plus className="w-4 h-4" /> Create your first job</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Open jobs */}
          {openJobs.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-[#5E7A76] mb-3">Open · {openJobs.length}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {openJobs.map((job, i) => <JobCard key={job.id} job={job} delay={i * 0.05} />)}
              </div>
            </div>
          )}

          {/* Closed jobs */}
          {closedJobs.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-[#5E7A76] mb-3">Closed · {closedJobs.length}</h2>
              <div className="grid sm:grid-cols-2 gap-4 opacity-60">
                {closedJobs.map((job, i) => <JobCard key={job.id} job={job} delay={i * 0.05} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Command palette */}
      <AnimatePresence>
        {cmdOpen && (
          <CommandPalette jobs={jobs} onClose={() => setCmdOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function JobCard({ job, delay }: { job: Job; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Link href={`/jobs/${job.id}`} className="block glass-card p-5 hover:shadow-card-hover transition-shadow group">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[#EAF3F0] group-hover:text-[#A4BF9D] transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-xs text-[#5E7A76] mt-0.5">{job.department || 'No department'} · {job.experienceLevel}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#5E7A76] group-hover:text-[#A4BF9D] transition-colors flex-shrink-0 mt-1" />
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className="flex items-center gap-1.5 text-[#5E7A76]">
            <Users className="w-3.5 h-3.5" /> {job.candidateCount}
          </span>
          {job.avgScore != null && (
            <span className="flex items-center gap-1.5 text-[#5E7A76]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-mono">{job.avgScore}</span> avg
            </span>
          )}
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
            job.status === 'open'
              ? 'bg-[rgba(164,191,157,0.12)] text-[#A4BF9D]'
              : 'bg-[rgba(94,122,118,0.12)] text-[#5E7A76]'
          }`}>
            {job.status}
          </span>
        </div>

        {/* Required skills */}
        {job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {job.requiredSkills.slice(0, 3).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-[rgba(164,191,157,0.06)] text-[#5E7A76]">{s}</span>
            ))}
            {job.requiredSkills.length > 3 && (
              <span className="text-xs text-[#5E7A76]">+{job.requiredSkills.length - 3}</span>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
