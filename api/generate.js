const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
};

function sendJson(res, status, body) {
  res.statusCode = status;
  Object.entries(JSON_HEADERS).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(body));
}

function parseList(value = '') {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function topicFrom(payload = {}) {
  return payload.mainKeyword?.trim() || payload.selectedIdea?.title || 'your topic';
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

function mockResult(action, payload = {}) {
  const topic = topicFrom(payload);
  const keywords = [payload.mainKeyword, ...(payload.relatedKeywords || [])].filter(Boolean).join(', ');

  if (action === 'ideas') {
    return [
      {
        id: 'idea-1',
        title: `How to Build a Practical Strategy for ${topic}`,
        angle: 'A clear educational guide with examples, comparison points, and implementation steps.',
        audience: 'Readers researching the topic before making a decision.',
      },
      {
        id: 'idea-2',
        title: `${topic}: What Buyers and Researchers Need to Know`,
        angle: 'A search-intent article that answers definitions, use cases, risks, and evaluation criteria.',
        audience: 'People comparing options and looking for reliable explanations.',
      },
      {
        id: 'idea-3',
        title: `The Complete ${topic} Checklist for Better AI Search Visibility`,
        angle: 'A GEO-focused checklist built around extractable answers, citations, and structured sections.',
        audience: 'Content teams improving articles for search engines and answer engines.',
      },
    ];
  }

  if (action === 'outline') {
    return [
      {
        id: 'section-1',
        heading: `What ${topic} Means`,
        bullets: ['Define the topic in plain language', 'Explain who should care and why', 'Add a concise answer-style summary'],
      },
      {
        id: 'section-2',
        heading: 'Key Benefits and Tradeoffs',
        bullets: ['Cover practical advantages', 'Include limitations and common mistakes', 'Show comparison criteria'],
      },
      {
        id: 'section-3',
        heading: 'How to Evaluate Your Options',
        bullets: ['List decision factors', 'Explain evidence to look for', 'Connect the topic to next steps'],
      },
      {
        id: 'section-4',
        heading: 'FAQ',
        bullets: ['Answer short questions directly', 'Use language that can be quoted by answer engines'],
      },
    ];
  }

  if (action === 'seo') {
    const title = payload.selectedIdea?.title || `A Practical Guide to ${topic}`;
    return {
      metaTitle: title.slice(0, 60),
      metaDescription: `Learn the key benefits, tradeoffs, evaluation criteria, and GEO considerations for ${topic}.`.slice(0, 155),
      slug: slugify(title || topic),
      keywords: [payload.mainKeyword || topic, ...(payload.relatedKeywords || [])].filter(Boolean),
      socialTitle: title,
      socialDescription: `A clear, structured guide to ${topic} for search and answer-engine visibility.`,
    };
  }

  const geoReport = `## GEO Performance Report

### Coverage
Observed: The draft covers definitions, benefits, tradeoffs, evaluation criteria, and FAQ-style answers for ${topic}.

Inferred: This coverage can help answer engines map the page to both broad and long-tail questions.

### Citation
Observed: The draft includes placeholders for authority links and asks writers to support specific claims.

Inferred: Stronger citations should improve extractability and reduce vague claims.

### Behavior
Observed: The structure uses clear headings, short answer blocks, and scannable lists.

Inferred: This makes the content easier for AI systems to summarize or quote without losing context.

### Business
Observed: The draft connects user intent to practical evaluation steps without forced promotional language.

Inferred: This can support conversion while keeping the article useful and trustworthy.

### Limitations
This mock report does not use live search, ranking, analytics, or citation data. Treat it as a prompt-structure preview.`;

  if (action === 'geo') {
    return geoReport;
  }

  const outline = payload.outline?.length ? payload.outline : mockResult('outline', payload);
  const sections = outline
    .map((section) => {
      const bullets = (section.bullets || []).map((bullet) => `- ${bullet}`).join('\n');
      return `## ${section.heading}

${topic} should be explained with concrete context, practical examples, and enough specificity for both readers and answer engines.

${bullets}

[IMAGE PLACEHOLDER]`;
    })
    .join('\n\n');

  return {
    article: `# ${payload.selectedIdea?.title || `A Practical Guide to ${topic}`}

This draft targets ${keywords || 'primary and related search terms'} in ${payload.language || 'English'}.

${sections}

## Final Takeaway

The best ${topic} content is specific, structured, and honest about what is known, what is inferred, and what the reader should do next.`,
    geoReport,
  };
}

function buildPrompt(action, payload = {}) {
  const topic = topicFrom(payload);
  const language = payload.language || 'English';
  const relatedKeywords = (payload.relatedKeywords || []).join(', ');
  const requests = payload.additionalRequests || 'No additional requests.';

  const sharedContext = `Language: ${language}
Main keyword or topic: ${topic}
Related keywords: ${relatedKeywords || 'None provided'}
Target word count: ${payload.targetWordCount || 1200}
Additional requests: ${requests}

Do not include private notes, hidden reasoning, or unrequested process commentary.`;

  if (action === 'ideas') {
    return `${sharedContext}

Create 3 blog article ideas.

Return JSON only:
[
  {"id":"idea-1","title":"...","angle":"...","audience":"..."}
]`;
  }

  if (action === 'outline') {
    return `${sharedContext}

Create a blog outline for the selected idea. Include sections that answer definitions, use cases, tradeoffs, comparisons, FAQ-style questions, and next steps.

Return JSON only:
[
  {"id":"section-1","heading":"...","bullets":["..."]}
]`;
  }

  if (action === 'seo') {
    return `${sharedContext}

Create editable SEO metadata for the article.

Return JSON only:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "slug": "...",
  "keywords": ["..."],
  "socialTitle": "...",
  "socialDescription": "..."
}`;
  }

  if (action === 'geo') {
    return `${sharedContext}

Evaluate this article for GEO readiness:

${payload.article || 'No article text provided.'}

Use these layers:
- Coverage: topic coverage, adjacent questions, definitions, use cases, and reader concerns.
- Citation: specificity, attribution, and authority support.
- Behavior: extractable answers, comparison points, summaries, and reusable passages.
- Business: practical next steps that connect intent to action without forced promotional language.

Separate observed evidence from inferred evidence. Mention limitations and uncertainty. Return Markdown only.`;
  }

  return `${sharedContext}

Write a complete blog article using Markdown. Use exactly one # title, then clear ## and ### sections. Include FAQ coverage, concise answer blocks, natural keyword usage, and [IMAGE PLACEHOLDER] markers where visuals would help. Suggest authoritative references only when relevant.

After the article, create a GEO report with these layers:
- Coverage
- Citation
- Behavior
- Business

The GEO report must separate observed evidence from inferred evidence and mention limitations.

Return JSON only:
{
  "article": "...",
  "geoReport": "..."
}`;
}

function parseModelJson(text) {
  const cleaned = String(text || '')
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

async function callGateway(action, payload) {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) throw new Error('AI_GATEWAY_API_KEY is not configured.');

  const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.AI_GATEWAY_MODEL || 'openai/gpt-4.1-mini',
      messages: [{ role: 'user', content: buildPrompt(action, payload) }],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI Gateway request failed with status ${response.status}.`);
  }

  const body = await response.json();
  return parseModelJson(body.choices?.[0]?.message?.content);
}

async function callGemini(action, payload) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: buildPrompt(action, payload),
    config: {
      responseMimeType: action === 'geo' ? 'text/plain' : 'application/json',
      temperature: 0.4,
    },
  });

  const text = typeof response.text === 'function' ? response.text() : response.text;
  return action === 'geo' ? text : parseModelJson(text);
}

async function verifyAuth(req) {
  if (process.env.AUTH_REQUIRED !== 'true') return null;

  const authorization = req.headers.authorization || req.headers.Authorization || '';
  const token = authorization.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    const error = new Error('Authentication is required.');
    error.statusCode = 401;
    throw error;
  }

  let adminApp;
  let adminAuth;
  try {
    [adminApp, adminAuth] = await Promise.all([import('firebase-admin/app'), import('firebase-admin/auth')]);
  } catch {
    const error = new Error('AUTH_REQUIRED=true needs firebase-admin. Install it and configure server-side Firebase credentials.');
    error.statusCode = 500;
    throw error;
  }

  const { getApps, initializeApp, cert, applicationDefault } = adminApp;
  const { getAuth } = adminAuth;

  const existing = getApps()[0];
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const hasServiceAccount = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey;
  const app =
    existing ||
    initializeApp({
      credential: hasServiceAccount
        ? cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          })
        : applicationDefault(),
    });

  const decoded = await getAuth(app).verifyIdToken(token);
  const allowedDomains = parseList(process.env.ALLOWED_EMAIL_DOMAINS);
  const emailDomain = decoded.email?.split('@').pop()?.toLowerCase();

  if (allowedDomains.length && !allowedDomains.includes(emailDomain)) {
    const error = new Error('This email domain is not allowed.');
    error.statusCode = 403;
    throw error;
  }

  return decoded;
}

async function readBody(req) {
  if (typeof req.body === 'object' && req.body !== null) return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return sendJson(res, 204, {});
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  try {
    const body = await readBody(req);
    const action = body.action;
    const payload = body.payload || {};

    if (!['ideas', 'outline', 'article', 'article-segment', 'seo', 'geo'].includes(action)) {
      return sendJson(res, 400, { error: 'Unsupported generation action.' });
    }

    await verifyAuth(req);

    const provider = process.env.ENABLE_AI_MOCK !== 'false' ? 'mock' : process.env.AI_PROVIDER || 'mock';
    const authRequired = process.env.AUTH_REQUIRED === 'true';
    const allowPublicGeneration = process.env.ALLOW_PUBLIC_GENERATION === 'true';

    if (provider !== 'mock' && !authRequired && !allowPublicGeneration) {
      return sendJson(res, 403, {
        error:
          'Real AI generation is disabled for unauthenticated public use. Enable auth or set ALLOW_PUBLIC_GENERATION=true intentionally.',
      });
    }

    let result;
    if (provider === 'mock') {
      result = mockResult(action, payload);
    } else if (provider === 'gateway') {
      result = await callGateway(action, payload);
    } else if (provider === 'gemini') {
      result = await callGemini(action, payload);
    } else {
      return sendJson(res, 400, { error: `Unsupported AI_PROVIDER: ${provider}` });
    }

    return sendJson(res, 200, { result });
  } catch (error) {
    console.error(error);
    return sendJson(res, error.statusCode || 500, { error: error.message || 'Generation failed.' });
  }
}
