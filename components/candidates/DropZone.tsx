'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import {
  collection, addDoc, serverTimestamp, doc, updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';

interface FileUploadState {
  file: File;
  progress: number;
  status: 'uploading' | 'analyzing' | 'done' | 'error';
  error?: string;
  candidateId?: string;
}

interface DropZoneProps {
  jobId: string;
  user: User;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceLevel: string;
}

export function DropZone({ jobId, user, jobTitle, jobDescription, requiredSkills, experienceLevel }: DropZoneProps) {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);

  const updateUpload = (index: number, patch: Partial<FileUploadState>) => {
    setUploads((prev) => prev.map((u, i) => (i === index ? { ...u, ...patch } : u)));
  };

  const processFile = useCallback(async (file: File, index: number) => {
    try {
      // 1. Create candidate doc
      const candidateRef = await addDoc(
        collection(db, 'jobs', jobId, 'candidates'),
        {
          jobId,
          fileName: file.name,
          resumeBlobUrl: '', // Using Blob URL instead of Firebase Storage path
          status: 'uploading',
          pipelineStage: 'new',
          recruiterNotes: '',
          createdAt: serverTimestamp(),
        }
      );
      const candidateId = candidateRef.id;
      updateUpload(index, { candidateId });

      // 2. Upload to Vercel Blob
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          updateUpload(index, { progress: pct });
        },
      });

      // 3. Update storage path
      await updateDoc(doc(db, 'jobs', jobId, 'candidates', candidateId), {
        resumeBlobUrl: newBlob.url,
        status: 'analyzing',
      });
      updateUpload(index, { status: 'analyzing', progress: 100 });

      // 4. Call Gemini analysis API
      const idToken = await user.getIdToken();
      const res = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          jobId,
          candidateId,
          fileName: file.name,
          resumeBlobUrl: newBlob.url,
          jobTitle,
          jobDescription,
          requiredSkills,
          experienceLevel,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }

      updateUpload(index, { status: 'done' });
    } catch (err: any) {
      console.error('Upload error:', err);
      updateUpload(index, { status: 'error', error: err.message || 'Upload failed' });
    }
  }, [jobId, user, jobTitle, jobDescription, requiredSkills, experienceLevel]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const startIndex = uploads.length;
      const newUploads: FileUploadState[] = acceptedFiles.map((f) => ({
        file: f,
        progress: 0,
        status: 'uploading',
      }));
      setUploads((prev) => [...prev, ...newUploads]);
      await Promise.all(acceptedFiles.map((f, i) => processFile(f, startIndex + i)));
    },
    [uploads.length, processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: true,
  });

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-[#A4BF9D] bg-[rgba(164,191,157,0.08)]'
            : 'border-[rgba(164,191,157,0.2)] hover:border-[rgba(164,191,157,0.5)] hover:bg-[rgba(164,191,157,0.04)]'
          }
        `}
      >
        <input {...getInputProps()} aria-label="Upload resumes" />
        <motion.div
          animate={{ scale: isDragActive ? 1.05 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex flex-col items-center gap-3"
        >
          <div className={`p-4 rounded-2xl ${isDragActive ? 'bg-[rgba(164,191,157,0.15)]' : 'bg-[rgba(164,191,157,0.08)]'}`}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-[#A4BF9D]' : 'text-[#5E7A76]'}`} />
          </div>
          <div>
            <p className="font-semibold text-[#EAF3F0]">
              {isDragActive ? 'Drop resumes here' : 'Drop resumes here, or click to browse'}
            </p>
            <p className="text-sm text-[#5E7A76] mt-1">PDF and DOCX files, up to 10 at once</p>
          </div>
        </motion.div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {uploads.map((upload, i) => (
          <motion.div
            key={`${upload.file.name}-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#5E7A76] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-[#EAF3F0] truncate">{upload.file.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {upload.status === 'uploading' && (
                      <span className="text-xs text-[#5E7A76]">{upload.progress}%</span>
                    )}
                    {upload.status === 'analyzing' && (
                      <span className="flex items-center gap-1.5 text-xs text-[#E8C468]">
                        <Loader2 className="w-3 h-3 animate-spin" /> Analyzing
                      </span>
                    )}
                    {upload.status === 'done' && (
                      <CheckCircle className="w-4 h-4 text-[#A4BF9D]" />
                    )}
                    {upload.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-[#D97878]" />
                    )}
                    {(upload.status === 'done' || upload.status === 'error') && (
                      <button onClick={() => removeUpload(i)} className="text-[#5E7A76] hover:text-[#EAF3F0]">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {upload.status === 'uploading' && (
                  <div className="h-1 bg-[rgba(164,191,157,0.1)] rounded-full mt-2">
                    <motion.div
                      className="h-full bg-[#A4BF9D] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${upload.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
                {upload.status === 'error' && (
                  <p className="text-xs text-[#D97878] mt-1">{upload.error}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
