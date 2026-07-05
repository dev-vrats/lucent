'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, Plus, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Job, Candidate } from '@/types';

interface CommandPaletteProps {
  jobs: Job[];
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  sub?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({ jobs, onClose }: CommandPaletteProps) {
  const [query, setQuery]   = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const staticCommands: CommandItem[] = [
    {
      id: 'new-job',
      label: 'New Job',
      sub: 'Create a new job posting',
      icon: <Plus className="w-4 h-4 text-[#A4BF9D]" />,
      action: () => { router.push('/jobs/new'); onClose(); },
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      sub: 'Go to overview',
      icon: <Briefcase className="w-4 h-4 text-[#5E7A76]" />,
      action: () => { router.push('/dashboard'); onClose(); },
    },
  ];

  const jobCommands: CommandItem[] = jobs.map((j) => ({
    id: j.id,
    label: j.title,
    sub: `${j.candidateCount} candidates · ${j.status}`,
    icon: <Briefcase className="w-4 h-4 text-[#5E7A76]" />,
    action: () => { router.push(`/jobs/${j.id}`); onClose(); },
  }));

  const all = [...staticCommands, ...jobCommands];
  const filtered = query
    ? all.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : all;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[activeIdx]) { filtered[activeIdx].action(); }
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-lg glass-card overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.94, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -16 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[rgba(164,191,157,0.1)]">
          <Search className="w-4 h-4 text-[#5E7A76] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            placeholder="Search jobs, candidates, actions…"
            className="flex-1 bg-transparent text-[#EAF3F0] placeholder:text-[#5E7A76] text-sm outline-none"
          />
          <kbd className="hidden sm:inline-flex text-xs text-[#5E7A76] bg-[rgba(164,191,157,0.08)] px-1.5 py-0.5 rounded">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <p className="text-sm text-[#5E7A76] text-center py-8">No results for "{query}"</p>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === activeIdx ? 'bg-[rgba(164,191,157,0.1)]' : 'hover:bg-[rgba(164,191,157,0.06)]'
                }`}
                onClick={item.action}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {item.icon}
                <div className="min-w-0">
                  <p className="text-sm text-[#EAF3F0]">{item.label}</p>
                  {item.sub && <p className="text-xs text-[#5E7A76] truncate">{item.sub}</p>}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[rgba(164,191,157,0.08)] flex items-center gap-3 text-xs text-[#5E7A76]">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
        </div>
      </motion.div>
    </div>
  );
}
