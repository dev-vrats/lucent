import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { analyzeResume } from '@/lib/gemini';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    // Verify auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);

    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, candidateId, fileName, resumeBlobUrl, jobTitle, jobDescription, requiredSkills, experienceLevel } = body;

    if (!jobId || !candidateId || !resumeBlobUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify job ownership
    const jobDoc = await adminDb.doc(`jobs/${jobId}`).get();
    if (!jobDoc.exists || jobDoc.data()?.ownerId !== uid) {
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 403 });
    }

    // Set status to analyzing
    const candidateRef = adminDb.doc(`jobs/${jobId}/candidates/${candidateId}`);
    await candidateRef.update({ status: 'analyzing' });

    // Fetch file from Vercel Blob
    const fileRes = await fetch(resumeBlobUrl);
    if (!fileRes.ok) {
      throw new Error(`Failed to download resume from Blob: ${fileRes.statusText}`);
    }
    const fileBuffer = Buffer.from(await fileRes.arrayBuffer());

    const isPDF = fileName.toLowerCase().endsWith('.pdf');
    const isDOCX = fileName.toLowerCase().endsWith('.docx');

    let resumeContent: string | { mimeType: string; data: string };

    if (isPDF) {
      // PDFs go directly to Gemini as native file parts
      resumeContent = {
        mimeType: 'application/pdf',
        data: fileBuffer.toString('base64'),
      };
    } else if (isDOCX) {
      // DOCX: convert to plain text via mammoth
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      resumeContent = result.value;
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF or DOCX.' }, { status: 400 });
    }

    // Call Gemini
    const analysis = await analyzeResume({
      jobTitle,
      jobDescription,
      requiredSkills: requiredSkills || [],
      experienceLevel: experienceLevel || 'mid',
      resumeContent,
    });

    // Write result to Firestore
    await candidateRef.update({
      status: 'analyzed',
      analysis,
    });

    // Update job's candidateCount and avgScore
    const allCandidates = await adminDb
      .collection(`jobs/${jobId}/candidates`)
      .where('status', '==', 'analyzed')
      .get();

    const scores: number[] = allCandidates.docs
      .map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data()?.analysis?.overallMatchScore as number | undefined)
      .filter((s): s is number => typeof s === 'number');

    const avgScore: number | null = scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : null;

    await adminDb.doc(`jobs/${jobId}`).update({
      candidateCount: allCandidates.size,
      avgScore,
    });

    return NextResponse.json({ success: true, analysis });
  } catch (err: any) {
    console.error('analyze-resume error:', err);

    // Try to mark candidate as error
    try {
      const body = await req.json().catch(() => ({}));
      if (body.jobId && body.candidateId) {
        await adminDb
          .doc(`jobs/${body.jobId}/candidates/${body.candidateId}`)
          .update({ status: 'error' });
      }
    } catch {}

    return NextResponse.json(
      { error: err.message || 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
