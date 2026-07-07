import { Timestamp } from 'firebase/firestore';

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead';
export type JobStatus = 'open' | 'closed';
export type CandidateStatus = 'uploading' | 'analyzing' | 'analyzed' | 'error';
export type PipelineStage = 'new' | 'reviewed' | 'shortlisted' | 'interview' | 'rejected' | 'hired';

export interface Job {
  id: string;
  ownerId: string;
  title: string;
  department?: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: ExperienceLevel;
  status: JobStatus;
  candidateCount: number;
  avgScore?: number;
  createdAt: Timestamp;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface ScoreBreakdown {
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
}

export interface CandidateAnalysis {
  candidateName: string;
  email?: string | null;
  phone?: string | null;
  yearsOfExperience: number;
  extractedSkills: string[];
  education: Education[];
  keyHighlights: string[];
  strengths: string[];
  gaps: string[];
  scoreBreakdown: ScoreBreakdown;
  overallMatchScore: number;
  oneLineVerdict: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  fileName: string;
  resumeBlobUrl: string;
  status: CandidateStatus;
  pipelineStage: PipelineStage;
  analysis?: CandidateAnalysis;
  recruiterNotes?: string;
  createdAt: Timestamp;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const PIPELINE_STAGES: { value: PipelineStage; label: string; color: string }[] = [
  { value: 'new',         label: 'New',         color: '#5E7A76' },
  { value: 'reviewed',    label: 'Reviewed',     color: '#93AFA8' },
  { value: 'shortlisted', label: 'Shortlisted',  color: '#A4BF9D' },
  { value: 'interview',   label: 'Interview',    color: '#E8C468' },
  { value: 'rejected',    label: 'Rejected',     color: '#D97878' },
  { value: 'hired',       label: 'Hired',        color: '#A4BF9D' },
];

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry',  label: 'Entry Level' },
  { value: 'mid',    label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead',   label: 'Lead / Principal' },
];

export function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--score-high)';
  if (score >= 50) return 'var(--score-mid)';
  return 'var(--score-low)';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Strong Match';
  if (score >= 50) return 'Partial Match';
  return 'Weak Match';
}
