'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, BarChart3, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Simulated resume cards for the hero animation
const DEMO_CARDS = [
  { name: 'Alex Chen',      score: 94, role: 'Senior Engineer',  color: '#A4BF9D' },
  { name: 'Jordan Rivera',  score: 81, role: 'Full Stack Dev',   color: '#A4BF9D' },
  { name: 'Sam Patel',      score: 67, role: 'Backend Dev',      color: '#E8C468' },
  { name: 'Taylor Kim',     score: 43, role: 'Junior Dev',       color: '#D97878' },
];

function HeroCards() {
  return (
    <div className="relative w-full max-w-sm mx-auto h-72 select-none">
      {DEMO_CARDS.map((card, i) => (
        <motion.div
          key={card.name}
          className="absolute w-full glass-card px-5 py-4 flex items-center gap-4"
          style={{ originX: 0.5, originY: 0 }}
          initial={{ y: i * 20, opacity: 0, rotate: (i - 1.5) * 2 }}
          animate={{ y: i * 68, opacity: 1, rotate: 0 }}
          transition={{
            delay: 0.3 + i * 0.15,
            type: 'spring',
            stiffness: 160,
            damping: 22,
          }}
        >
          {/* Rank */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
            style={{
              backgroundColor: `${card.color}22`,
              color: card.color,
              border: `1px solid ${card.color}44`,
            }}
          >
            {i + 1}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#EAF3F0] text-sm">{card.name}</p>
            <p className="text-xs text-[#5E7A76]">{card.role}</p>
          </div>

          {/* Score */}
          <span
            className="font-mono font-bold text-lg"
            style={{ color: card.color }}
          >
            {card.score}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'AI-Ranked in Minutes',
    desc: 'Gemini reads every resume and returns structured scores — not hunches.',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Explainable Scores',
    desc: 'Skills match, experience match, education match — broken down per candidate.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Built Responsibly',
    desc: 'Scored on job-relevant qualifications only. You always make the final call.',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Real-Time Updates',
    desc: 'Watch the ranked list re-sort live as each analysis completes.',
  },
];

const TRIVIA = [
  "Leonardo da Vinci's 1482 letter to the Duke of Milan pitching his engineering skills is one of history's earliest known 'resumes' — painting was almost an afterthought.",
  "The word résumé comes from the French résumer — 'to summarize.'",
  "The cover letter predates the résumé by centuries — a written letter of introduction was once the only way to apply for skilled work.",
  "LinkedIn launched in 2003 out of a founder's living room.",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#A4BF9D] flex items-center justify-center">
            <span className="text-[#071A1F] font-bold text-sm font-mono">L</span>
          </div>
          <span className="font-display text-lg font-semibold text-[#EAF3F0]">Lucent</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 grid lg:grid-cols-2 gap-12 items-center px-6 md:px-12 py-16 max-w-7xl mx-auto w-full">
        {/* Left — copy */}
        <div className="space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(164,191,157,0.1)] text-[#A4BF9D] border border-[rgba(164,191,157,0.2)] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A4BF9D] animate-pulse" />
              Powered by Google Gemini
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-[#EAF3F0] leading-tight">
              See your candidates{' '}
              <span className="text-[#A4BF9D] italic">clearly.</span>
            </h1>
          </motion.div>

          <motion.p
            className="text-lg text-[#93AFA8] leading-relaxed max-w-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            Upload a batch of resumes, get back an AI-ranked shortlist with
            explainable scores in minutes. Who matches, why, and where the gaps
            are — with the final call always yours.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link href="/signup">
              <Button size="lg">
                Start screening free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">Sign in</Button>
            </Link>
          </motion.div>

          <motion.p
            className="text-xs text-[#5E7A76]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            AI scoring is decision support — you make the call.
          </motion.p>
        </div>

        {/* Right — animated card stack */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <HeroCards />
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto w-full">
        <motion.h2
          className="font-display text-3xl font-semibold text-center text-[#EAF3F0] mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Everything a recruiter needs.
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="glass-card p-6 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-[#A4BF9D]">{f.icon}</div>
              <h3 className="font-semibold text-[#EAF3F0]">{f.title}</h3>
              <p className="text-sm text-[#93AFA8]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-[rgba(164,191,157,0.08)] text-center">
        <p className="text-sm text-[#5E7A76]">
          © {new Date().getFullYear()} Lucent. Built for humans, powered by AI.
        </p>
      </footer>
    </main>
  );
}
