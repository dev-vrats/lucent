'use client';

import { useState, useEffect } from 'react';
import {
  collection, query, onSnapshot, doc, updateDoc, orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Candidate, PipelineStage } from '@/types';

export function useCandidates(jobId: string | null) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'jobs', jobId, 'candidates'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Candidate));
        // Sort: analyzed candidates by score desc, then unanalyzed
        list.sort((a, b) => {
          if (a.analysis && b.analysis) {
            return b.analysis.overallMatchScore - a.analysis.overallMatchScore;
          }
          if (a.analysis) return -1;
          if (b.analysis) return 1;
          return 0;
        });
        setCandidates(list);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore candidates error:', err);
        setError('Failed to load candidates. Please refresh.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [jobId]);

  const updateCandidatePipeline = async (
    candidateId: string,
    stage: PipelineStage
  ) => {
    if (!jobId) return;
    await updateDoc(doc(db, 'jobs', jobId, 'candidates', candidateId), {
      pipelineStage: stage,
    });
  };

  const updateCandidateNotes = async (candidateId: string, notes: string) => {
    if (!jobId) return;
    await updateDoc(doc(db, 'jobs', jobId, 'candidates', candidateId), {
      recruiterNotes: notes,
    });
  };

  return {
    candidates,
    loading,
    error,
    updateCandidatePipeline,
    updateCandidateNotes,
  };
}
