'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, X, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import type { ExperienceLevel } from '@/types';
import { EXPERIENCE_LEVELS } from '@/types';
import toast from 'react-hot-toast';

export default function NewJobPage() {
  const { user } = useAuth();
  const { createJob } = useJobs(user);
  const router = useRouter();

  const [title, setTitle]           = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills]         = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [expLevel, setExpLevel]     = useState<ExperienceLevel>('mid');
  const [submitting, setSubmitting] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const addSkill = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const extractSkills = async () => {
    if (!description.trim()) {
      toast.error('Paste a job description first.');
      return;
    }
    setExtracting(true);
    try {
      const res = await fetch('/api/extract-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: description }),
      });
      if (!res.ok) throw new Error('Extraction failed');
      const { skills: extracted } = await res.json();
      const newSkills = extracted.filter((s: string) => !skills.includes(s.toLowerCase()));
      setSkills((prev) => [...prev, ...newSkills.map((s: string) => s.toLowerCase())]);
      toast.success(`Added ${newSkills.length} skill${newSkills.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Could not extract skills. Try again.');
    } finally {
      setExtracting(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim())       e.title       = 'Job title is required.';
    if (!description.trim()) e.description = 'Job description is required.';
    if (skills.length === 0) e.skills      = 'Add at least one required skill.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const jobId = await createJob({
        title: title.trim(),
        department: department.trim() || undefined,
        description: description.trim(),
        requiredSkills: skills,
        experienceLevel: expLevel,
      });
      toast.success('Job created!');
      router.push(`/jobs/${jobId}`);
    } catch {
      toast.error('Failed to create job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#5E7A76] hover:text-[#93AFA8] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold text-[#EAF3F0]">Create a job</h1>
        <p className="text-[#5E7A76] mt-1">Define the role so Lucent can rank candidates against it.</p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="glass-card p-7 space-y-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Title & Department */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            id="title"
            label="Job Title *"
            placeholder="e.g. Senior Backend Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />
          <Input
            id="department"
            label="Department"
            placeholder="e.g. Engineering"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        {/* Experience Level */}
        <div>
          <label className="text-sm font-medium text-[#EAF3F0] block mb-2">Experience Level</label>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setExpLevel(l.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  expLevel === l.value
                    ? 'bg-[rgba(164,191,157,0.2)] text-[#A4BF9D] border border-[rgba(164,191,157,0.4)]'
                    : 'bg-transparent text-[#5E7A76] border border-[rgba(164,191,157,0.1)] hover:border-[rgba(164,191,157,0.3)]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="description" className="text-sm font-medium text-[#EAF3F0]">
              Job Description *
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              loading={extracting}
              onClick={extractSkills}
              className="text-[#A4BF9D] gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Extract skills with AI
            </Button>
          </div>
          <Textarea
            id="description"
            placeholder="Paste the full job description here. Use 'Extract skills with AI' to auto-populate required skills."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            className="min-h-[180px]"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="text-sm font-medium text-[#EAF3F0] block mb-2">Required Skills *</label>
          {/* Chip display */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[rgba(164,191,157,0.1)] text-[#A4BF9D] border border-[rgba(164,191,157,0.2)]"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-[#EAF3F0]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <Input
            id="skill-input"
            placeholder="Type a skill and press Enter (e.g. TypeScript)"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            onBlur={() => skillInput.trim() && addSkill(skillInput)}
            error={errors.skills}
            hint="Press Enter or comma to add each skill"
          />
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button type="button" variant="ghost" className="w-full">Cancel</Button>
          </Link>
          <Button type="submit" loading={submitting} className="w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Create job
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
