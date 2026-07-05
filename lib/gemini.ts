import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use gemini-2.5-flash as the primary model
const MODEL_NAME = 'gemini-2.5-flash';

// Structured output schema for resume analysis
const RESUME_ANALYSIS_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    candidateName:      { type: SchemaType.STRING },
    email:              { type: SchemaType.STRING, nullable: true },
    phone:              { type: SchemaType.STRING, nullable: true },
    yearsOfExperience:  { type: SchemaType.NUMBER },
    extractedSkills:    { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          degree:      { type: SchemaType.STRING },
          institution: { type: SchemaType.STRING },
          year:        { type: SchemaType.STRING },
        },
        required: ['degree', 'institution', 'year'],
      },
    },
    keyHighlights: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    strengths:     { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    gaps:          { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    scoreBreakdown: {
      type: SchemaType.OBJECT,
      properties: {
        skillsMatch:     { type: SchemaType.NUMBER },
        experienceMatch: { type: SchemaType.NUMBER },
        educationMatch:  { type: SchemaType.NUMBER },
      },
      required: ['skillsMatch', 'experienceMatch', 'educationMatch'],
    },
    overallMatchScore: { type: SchemaType.NUMBER },
    oneLineVerdict:    { type: SchemaType.STRING },
  },
  required: ['candidateName', 'yearsOfExperience', 'extractedSkills', 'scoreBreakdown', 'overallMatchScore', 'oneLineVerdict'],
};

const SYSTEM_INSTRUCTION = `You are an expert technical recruiter with deep experience evaluating candidates across software engineering, product, and business roles. 

Your job is to objectively score a candidate's resume against a specific job description based ONLY on professionally relevant qualifications:
- Skills match (technical and domain-relevant skills)
- Years and depth of relevant experience  
- Educational background relevant to the role

CRITICAL — Responsible AI guidelines:
- Do NOT infer, mention, or weight any protected characteristics: age, gender, name-based ethnicity assumptions, nationality, marital status, disability, religion, or any demographic signal.
- Evaluate solely on demonstrable professional qualifications relevant to the role.
- Phrase "gaps" constructively — frame them as areas to explore in an interview, not disqualifying factors. Example: "No direct experience with Kubernetes — worth exploring comfort level with container orchestration in the interview" rather than "Lacks Kubernetes experience."
- Scores must be integers between 0 and 100. Overall score is a weighted blend: 50% skills match + 30% experience match + 20% education match.
- keyHighlights: 2-4 concise bullet points of the candidate's most impressive relevant achievements.
- strengths: 3-5 specific reasons this person could excel in this role.
- gaps: 2-4 specific areas where the candidate may need onboarding or where more context would help — phrased as interview questions, not red flags.
- oneLineVerdict: one crisp sentence that a recruiter can read in 2 seconds to understand this person's fit. E.g. "Strong backend engineer with deep Python expertise — limited cloud-native experience worth exploring."`;

interface ResumeAnalysisInput {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceLevel: string;
  resumeContent: string | { mimeType: string; data: string }; // text or base64 file
}

export async function analyzeResume(input: ResumeAnalysisInput) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESUME_ANALYSIS_SCHEMA as any,
    },
  });

  const jobContext = `
JOB TITLE: ${input.jobTitle}
EXPERIENCE LEVEL: ${input.experienceLevel}
REQUIRED SKILLS: ${input.requiredSkills.join(', ')}

JOB DESCRIPTION:
${input.jobDescription}
`.trim();

  const parts: any[] = [{ text: `Analyze this resume for the following role:\n\n${jobContext}\n\n---\nRESUME:` }];

  if (typeof input.resumeContent === 'string') {
    parts.push({ text: '\n' + input.resumeContent });
  } else {
    parts.push({ inlineData: input.resumeContent });
  }

  const result = await model.generateContent(parts);
  const responseText = result.response.text();
  return JSON.parse(responseText);
}

// Schema for skill extraction
const SKILLS_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ['skills'],
};

export async function extractSkillsFromJD(jobDescription: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: SKILLS_SCHEMA as any,
    },
  });

  const result = await model.generateContent(
    `Extract a concise list of required technical and professional skills from this job description. Return each skill as a short tag (2-4 words max). Include both hard skills (technologies, tools, frameworks) and key soft skills if explicitly required. Return 5-15 skills total.\n\nJob Description:\n${jobDescription}`
  );

  const parsed = JSON.parse(result.response.text());
  return parsed.skills || [];
}
