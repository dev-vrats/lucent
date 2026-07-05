'use client';

import { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job, JobStatus, ExperienceLevel } from '@/types';
import { User } from 'firebase/auth';

export function useJobs(user: User | null) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setJobs([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'jobs'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const jobList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
        setJobs(jobList);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore jobs error:', err);
        setError('Failed to load jobs. Please refresh.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const createJob = async (data: {
    title: string;
    department?: string;
    description: string;
    requiredSkills: string[];
    experienceLevel: ExperienceLevel;
  }) => {
    if (!user) throw new Error('Not authenticated');
    const docRef = await addDoc(collection(db, 'jobs'), {
      ...data,
      ownerId: user.uid,
      status: 'open' as JobStatus,
      candidateCount: 0,
      avgScore: null,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    await updateDoc(doc(db, 'jobs', jobId), updates);
  };

  const deleteJob = async (jobId: string) => {
    await deleteDoc(doc(db, 'jobs', jobId));
  };

  return { jobs, loading, error, createJob, updateJob, deleteJob };
}
