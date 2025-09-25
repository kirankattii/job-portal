const axios = require('axios');

// Google Generative Language API (Gemini)
// REST reference: https://ai.google.dev/api/rest/v1beta/models.generateContent

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

function inferMimeTypeFromUrl(url) {
  const lower = (url || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.txt')) return 'text/plain';
  return 'application/octet-stream';
}

async function downloadFileAsBase64(fileUrl) {
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const contentType = response.headers && response.headers['content-type'] ? response.headers['content-type'] : inferMimeTypeFromUrl(fileUrl);
  const base64 = Buffer.from(response.data).toString('base64');
  return { base64, mimeType: contentType };
}

function buildSystemPrompt() {
  return 'Extract structured candidate profile data: full_name, email, phone, skills (array), experience_years, current_position, current_company, preferred_location, education. Return only valid JSON matching this flat schema with keys: {"full_name":"string","email":"string","phone":"string","skills":["string"],"experience_years":number,"current_position":"string","current_company":"string","preferred_location":"string","education":"string"}. If information is missing, use null or an empty array for skills.';
}

async function callGeminiWithFile({ base64, mimeType }) {
  if (!GEMINI_API_KEY) {
    const err = new Error('Gemini API key is not configured. Set GEMINI_API_KEY or GOOGLE_API_KEY.');
    err.statusCode = 500;
    throw err;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const systemInstruction = buildSystemPrompt();

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Resume file content provided below. Extract and return JSON only.' },
          { inline_data: { mime_type: mimeType, data: base64 } }
        ]
      }
    ],
    generationConfig: {
      temperature: 0,
      response_mime_type: 'application/json'
    }
  };

  const { data } = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000
  });

  // Parse JSON from Gemini response
  const candidate = data && Array.isArray(data.candidates) && data.candidates.length > 0 ? data.candidates[0] : null;
  const parts = candidate && candidate.content && Array.isArray(candidate.content.parts) ? candidate.content.parts : [];
  const textPart = parts.find(p => typeof p.text === 'string');
  const text = textPart && textPart.text ? textPart.text : '';

  if (!text) {
    const err = new Error('Empty response from Gemini');
    err.statusCode = 502;
    throw err;
  }

  // Some models wrap JSON in code fences or add commentary; attempt to isolate JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : text;

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    const err = new Error('Failed to parse JSON from Gemini response');
    err.details = { raw: text };
    err.statusCode = 502;
    throw err;
  }
}

/**
 * Parse a resume from a Cloudinary (or any) URL using Gemini.
 * @param {string} resumeUrl - Publicly accessible URL to the resume file
 * @returns {Promise<object>} Parsed candidate profile JSON
 */
async function parseResumeFromUrl(resumeUrl) {
  if (!resumeUrl || typeof resumeUrl !== 'string') {
    const err = new Error('resumeUrl must be a non-empty string');
    err.statusCode = 400;
    throw err;
  }

  const { base64, mimeType } = await downloadFileAsBase64(resumeUrl);
  const parsed = await callGeminiWithFile({ base64, mimeType });
  return parsed;
}

module.exports = {
  parseResumeFromUrl
};


