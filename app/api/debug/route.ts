import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    firebaseProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'missing',
    firebaseClientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'missing',
    firebasePrivateKeyLength: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 0,
  });
}
