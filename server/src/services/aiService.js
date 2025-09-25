const axios = require('axios');
const { parseResumeFromUrl } = require('./resumeParser');

/**
 * AI Service using Google Gemini Embeddings (gemini-embedding-001)
 *
 * Docs: https://ai.google.dev/gemini-api/docs/embeddings
 * Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent
 * Auth: header "x-goog-api-key: <API_KEY>" (uses process.env.GEMINI_API_KEY)
 */

const GEMINI_EMBEDDINGS_MODEL = 'gemini-embedding-001';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Generate an embedding vector for input text using Gemini embeddings.
 * Returns an array of numbers (vector).
 *
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment');
  }

  const url = `${GEMINI_BASE_URL}/models/${GEMINI_EMBEDDINGS_MODEL}:embedContent`;
  try {
    const response = await axios.post(
      url,
      {
        content: {
          parts: [
            { text }
          ]
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        timeout: 30000
      }
    );

    // Response shape: { embedding: { values: number[] } }
    const values = response?.data?.embedding?.values || [];
    return Array.isArray(values) ? values : [];
  } catch (error) {
    const message = error?.response?.data || error.message || 'Failed to fetch embedding';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}

/**
 * Compute cosine similarity between two vectors. Returns 0..1.
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    const a = vecA[i] || 0;
    const b = vecB[i] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) return 0;
  const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  // Normalize to 0..1 from [-1..1]
  return Math.max(0, Math.min(1, (sim + 1) / 2));
}

/**
 * Build canonical text for job.
 * @param {object} job
 */
function buildJobText(job) {
  const title = job?.title || '';
  const description = job?.description || '';
  const skills = Array.isArray(job?.requiredSkills) ? job.requiredSkills.join(', ') : '';
  const location = job?.location || '';
  return `${title} ${description} skills: ${skills} location: ${location}`.trim();
}

/**
 * Build canonical text for user profile.
 * Accepts User mongoose doc or plain object.
 * @param {object} user
 */
function buildProfileText(user) {
  const name = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const currentPosition = user?.currentPosition || '';
  const skillsArr = Array.isArray(user?.skills)
    ? user.skills.map(s => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
    : [];
  const skills = skillsArr.join(', ');
  const experienceYears = user?.experienceYears != null ? String(user.experienceYears) : '';
  const currentLocation = user?.currentLocation || '';
  const preferredLocation = user?.preferredLocation || '';
  return `${name} ${currentPosition} ${skills} experience: ${experienceYears} ${currentLocation} ${preferredLocation}`.trim();
}

/**
 * Compute match score and details between a job and a user profile.
 * Uses embeddings + cosine similarity (0..1) then returns score 0..100.
 * @param {object} job
 * @param {object} user
 * @param {object} options
 * @returns {Promise<{ score: number, similarity: number, matchedSkills: string[], missingSkills: string[] }>} 
 */
async function computeMatchScore(job, user, options = {}) {
  const jobText = buildJobText(job);
  const profileText = options.profileText || buildProfileText(user);

  // Use cached user embeddings if available and likely computed from profileText
  let userEmbedding = Array.isArray(user?.embeddings) && user.embeddings.length > 0 ? user.embeddings : null;
  if (!userEmbedding) {
    userEmbedding = await generateEmbedding(profileText);
  }
  const jobEmbedding = await generateEmbedding(jobText);

  const similarity = cosineSimilarity(jobEmbedding, userEmbedding);
  const score = Math.round(similarity * 100);

  // Simple skills matching via set intersection
  const jobSkills = new Set(
    (Array.isArray(job?.requiredSkills) ? job.requiredSkills : [])
      .map(s => String(s).toLowerCase().trim())
      .filter(Boolean)
  );
  const profileSkills = new Set(
    (Array.isArray(user?.skills) ? user.skills.map(s => (typeof s === 'string' ? s : s?.name)) : [])
      .map(s => String(s).toLowerCase().trim())
      .filter(Boolean)
  );
  const matchedSkills = [...jobSkills].filter(s => profileSkills.has(s));
  const missingSkills = [...jobSkills].filter(s => !profileSkills.has(s));

  return { score, similarity, matchedSkills, missingSkills };
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  computeMatchScore,
  buildJobText,
  buildProfileText
};

/**
 * Use Gemini to compare a job description against parsed resume JSON and
 * return a similarity percentage (0-100). This relies on text generation
 * endpoint with a strict instruction to output only a number.
 * @param {string} jobDescription
 * @param {object} parsedResume
 * @returns {Promise<number>} 0-100
 */
async function computeGeminiSimilarityFromParsed(jobDescription, parsedResume) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY/GOOGLE_API_KEY not configured');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  const url = `${GEMINI_BASE_URL}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const systemInstruction = [
    'You are an ATS engine. Compare the job description to the candidate data and output a similarity percentage from 0 to 100.',
    'Consider skills alignment, years of experience, current position/company relevance, and location fit.',
    'Respond with only a number (integer 0-100).'
  ].join(' ');

  const candidateJson = JSON.stringify(parsedResume || {});

  const payload = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [
      {
        role: 'user',
        parts: [
          { text: `Job Description:\n${jobDescription || ''}` },
          { text: `\nCandidate Data (JSON):\n${candidateJson}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0,
      response_mime_type: 'text/plain'
    }
  };

  const resp = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000
  });

  const text = resp?.data?.candidates?.[0]?.content?.parts?.find(p => typeof p.text === 'string')?.text || '';
  const numMatch = text.match(/\d{1,3}/);
  const value = numMatch ? Number(numMatch[0]) : 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Helper to compute ATS score from job and a user's resume URL by parsing first.
 * @param {object} job - must include description
 * @param {string} resumeUrl
 * @returns {Promise<{score:number, parsed:object}>}
 */
async function computeAtsScoreFromResume(job, resumeUrl) {
  const parsed = await parseResumeFromUrl(resumeUrl);
  const score = await computeGeminiSimilarityFromParsed(job?.description || '', parsed);
  return { score, parsed };
}

module.exports.computeGeminiSimilarityFromParsed = computeGeminiSimilarityFromParsed;
module.exports.computeAtsScoreFromResume = computeAtsScoreFromResume;


