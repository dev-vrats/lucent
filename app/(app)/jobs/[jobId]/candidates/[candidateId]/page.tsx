'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, GraduationCap, CheckCircle, AlertTriangle, Lightbulb, Save } from 'lucide-react';
import Link from 'next/link';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, RadialBarChart, RadialBar, Legend,
} from 'recharts';
import type { Candidate, Job } from '@/types';
import { PIPELINE_STAGES, getScoreColor } from '@/types';
import { ScoreRing } from '@/components/candidates/ScoreRing';
import { PipelineBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function CandidateDetailPage() {
  const params = useParams<{ jobId: string; candidateId: string }>();
  const { jobId, candidateId } = params;
  const router = useRouter();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob]             = useState<Job | null>(null);
  const [notes, setNotes]         = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('');

  useEffect(() => {
    if (!jobId || !candidateId) return;
    const unsub = onSnapshot(doc(db, 'jobs', jobId, 'candidates', candidateId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Candidate;
        setCandidate(data);
        setNotes(data.recruiterNotes ?? '');
        setSelectedStage(data.pipelineStage);
      }
    });
    return unsub;
  }, [jobId, candidateId]);

  useEffect(() => {
    if (!jobId) return;
    const unsub = onSnapshot(doc(db, 'jobs', jobId), (snap) => {
      if (snap.exists()) setJob({ id: snap.id, ...snap.data() } as Job);
    });
    return unsub;
  }, [jobId]);

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateDoc(doc(db, 'jobs', jobId, 'candidates', candidateId), { recruiterNotes: notes });
      toast.success('Notes saved.');
    } catch { toast.error('Failed to save notes.'); }
    finally { setSavingNotes(false); }
  };

  const changeStage = async (stage: string) => {
    setSelectedStage(stage);
    await updateDoc(doc(db, 'jobs', jobId, 'candidates', candidateId), { pipelineStage: stage });
    toast.success(`Moved to ${stage}`);
  };

  if (!candidate?.analysis) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-[#5E7A76]">
            {!candidate ? 'Loading…' : 'Analysis not available yet.'}
          </p>
          <Link href={`/jobs/${jobId}`}>
            <Button variant="ghost" className="mt-4">Back to job</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { analysis } = candidate;
  const scoreColor = getScoreColor(analysis.overallMatchScore);

  const radarData = [
    { subject: 'Skills',     score: analysis.scoreBreakdown.skillsMatch },
    { subject: 'Experience', score: analysis.scoreBreakdown.experienceMatch },
    { subject: 'Education',  score: analysis.scoreBreakdown.educationMatch },
  ];

  const barData = [
    { name: 'Skills Match',     value: analysis.scoreBreakdown.skillsMatch,     fill: '#A4BF9D' },
    { name: 'Experience Match', value: analysis.scoreBreakdown.experienceMatch,  fill: '#E8C468' },
    { name: 'Education Match',  value: analysis.scoreBreakdown.educationMatch,   fill: '#0145F2' },
  ];

  const matchedSkills = job?.requiredSkills.filter((s) =>
    analysis.extractedSkills.some((e) => e.toLowerCase().includes(s.toLowerCase()))
  ) ?? [];

  const missingSkills = job?.requiredSkills.filter((s) =>
    !matchedSkills.includes(s)
  ) ?? [];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <Link href={`/jobs/${jobId}`} className="inline-flex items-center gap-2 text-sm text-[#5E7A76] hover:text-[#93AFA8] transition-colors">
        <ArrowLeft className="w-4 h-4" /> {job?.title ?? 'Job'}
      </Link>

      {/* Hero header */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex flex-wrap items-start gap-6">
          {/* Score ring */}
          <ScoreRing score={analysis.overallMatchScore} size={100} strokeWidth={7} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl font-bold text-[#EAF3F0]">
              {analysis.candidateName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-[#5E7A76]">
              {analysis.email && (
                <a href={`mailto:${analysis.email}`} className="flex items-center gap-1.5 hover:text-[#93AFA8]">
                  <Mail className="w-3.5 h-3.5" /> {analysis.email}
                </a>
              )}
              {analysis.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {analysis.phone}
                </span>
              )}
              <span className="font-mono">{analysis.yearsOfExperience} yr{analysis.yearsOfExperience !== 1 ? 's' : ''} exp</span>
            </div>
            <p className="text-[#93AFA8] mt-3 italic">"{analysis.oneLineVerdict}"</p>
          </div>

          {/* Pipeline selector */}
          <div className="flex flex-col items-end gap-3">
            <select
              value={selectedStage}
              onChange={(e) => changeStage(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm bg-[rgba(15,46,54,0.8)] border border-[rgba(164,191,157,0.14)] text-[#93AFA8] focus:outline-none cursor-pointer"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Score breakdown */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Radar chart */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-semibold text-[#EAF3F0] mb-4">Score Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(164,191,157,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#93AFA8', fontSize: 12, fontFamily: 'var(--font-plus-jakarta)' }} />
              <Radar name="Score" dataKey="score" stroke="#A4BF9D" fill="#A4BF9D" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {barData.map((b) => (
              <div key={b.name} className="text-center">
                <p className="font-mono font-bold text-lg" style={{ color: b.fill }}>{b.value}</p>
                <p className="text-xs text-[#5E7A76]">{b.name.replace(' Match', '')}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Skills match */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="font-semibold text-[#EAF3F0] mb-4">Skills</h2>
          {matchedSkills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-[#5E7A76] mb-2">Matched required skills</p>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-[rgba(164,191,157,0.12)] text-[#A4BF9D] border border-[rgba(164,191,157,0.2)]">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {missingSkills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-[#5E7A76] mb-2">Missing required skills</p>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-[rgba(217,120,120,0.08)] text-[#D97878] border border-[rgba(217,120,120,0.2)]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.extractedSkills.length > 0 && (
            <div>
              <p className="text-xs text-[#5E7A76] mb-2">All extracted skills</p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.extractedSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-[rgba(164,191,157,0.05)] text-[#93AFA8] border border-[rgba(164,191,157,0.1)]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Highlights, Strengths, Gaps */}
      <div className="grid md:grid-cols-3 gap-5">
        {[
          { title: 'Key Highlights', items: analysis.keyHighlights, icon: <Lightbulb className="w-4 h-4 text-[#E8C468]" />, color: '#E8C468' },
          { title: 'Strengths',      items: analysis.strengths,     icon: <CheckCircle className="w-4 h-4 text-[#A4BF9D]" />, color: '#A4BF9D' },
          { title: 'Gaps to Explore', items: analysis.gaps,         icon: <AlertTriangle className="w-4 h-4 text-[#D97878]" />, color: '#D97878' },
        ].map(({ title, items, icon, color }, i) => (
          <motion.div
            key={title}
            className="glass-card p-5 space-y-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <div className="flex items-center gap-2">
              {icon}
              <h2 className="font-semibold text-[#EAF3F0] text-sm">{title}</h2>
            </div>
            <ul className="space-y-2">
              {items.map((item, j) => (
                <li key={j} className="text-sm text-[#93AFA8] flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Education */}
      {analysis.education.length > 0 && (
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-4 h-4 text-[#A4BF9D]" />
            <h2 className="font-semibold text-[#EAF3F0]">Education</h2>
          </div>
          <div className="space-y-3">
            {analysis.education.map((edu, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#A4BF9D] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#EAF3F0] text-sm">{edu.degree}</p>
                  <p className="text-xs text-[#5E7A76]">{edu.institution} · {edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recruiter notes */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[#EAF3F0]">Recruiter Notes</h2>
          <Button size="sm" variant="ghost" onClick={saveNotes} loading={savingNotes}>
            <Save className="w-3.5 h-3.5" /> Save
          </Button>
        </div>
        <Textarea
          id="recruiter-notes"
          placeholder="Add your notes about this candidate — impressions, follow-up items, interview questions…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[120px]"
        />
      </motion.div>

      <p className="text-xs text-[#5E7A76] text-center">AI scoring is decision support — you make the call.</p>
    </div>
  );
}
