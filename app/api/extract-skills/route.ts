import { NextRequest, NextResponse } from 'next/server';
import { extractSkillsFromJD } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { jobDescription } = await req.json();
    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }
    const skills = await extractSkillsFromJD(jobDescription);
    return NextResponse.json({ skills });
  } catch (err: any) {
    console.error('extract-skills error:', err);
    return NextResponse.json({ error: err.message || 'Failed to extract skills' }, { status: 500 });
  }
}
