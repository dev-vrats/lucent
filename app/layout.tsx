import type { Metadata } from 'next';
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AmbientGlow } from '@/components/background/AmbientGlow';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Lucent — Smart Resume Screening',
    template: '%s | Lucent',
  },
  description:
    'AI-powered resume screening and candidate ranking. Upload a batch of resumes and get a ranked, explainable shortlist in minutes.',
  keywords: ['resume screening', 'candidate ranking', 'AI recruiting', 'hiring', 'HR tech'],
  openGraph: {
    title: 'Lucent — Smart Resume Screening',
    description: 'See your candidates clearly.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans bg-[#071A1F] text-[#EAF3F0] min-h-screen">
        <AmbientGlow />
        <div className="relative z-10">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0F2E36',
              color: '#EAF3F0',
              border: '1px solid rgba(164,191,157,0.14)',
              borderRadius: '12px',
              fontFamily: 'var(--font-plus-jakarta)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#A4BF9D', secondary: '#071A1F' } },
            error:   { iconTheme: { primary: '#D97878', secondary: '#071A1F' } },
          }}
        />
      </body>
    </html>
  );
}
