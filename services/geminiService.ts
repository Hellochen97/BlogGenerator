import { auth } from '../firebase';
import type { ArticleResult, BlogIdea, GenerationAction, OutlineSection, SeoMetadata, WizardData } from '../types';

const clientMockEnabled = import.meta.env.VITE_ENABLE_CLIENT_MOCK !== 'false';

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function topicFrom(data: Partial<WizardData>) {
  return data.mainKeyword?.trim() || data.selectedIdea?.title || 'your topic';
}

function keywordText(data: Partial<WizardData>) {
  const keywords = [data.mainKeyword, ...(data.relatedKeywords ?? [])].filter(Boolean);
  return keywords.length ? keywords.join(', ') : 'primary and related search terms';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

function mockIdeas(data: Partial<WizardData>): BlogIdea[] {
  const topic = topicFrom(data);
  return [
    {
      id: makeId('idea'),
      title: `How to Build a Practical Strategy for ${topic}`,
      angle: 'A clear educational guide with examples, comparison points, and implementation steps.',
      audience: 'Readers researching the topic before making a decision.',
    },
    {
      id: makeId('idea'),
      title: `${topic}: What Buyers and Researchers Need to Know`,
      angle: 'A search-intent article that answers definitions, use cases, risks, and evaluation criteria.',
      audience: 'People comparing options and looking for reliable explanations.',
    },
    {
      id: makeId('idea'),
      title: `The Complete ${topic} Checklist for Better AI Search Visibility`,
      angle: 'A GEO-focused checklist built around extractable answers, citations, and structured sections.',
      audience: 'Content teams improving articles for search engines and answer engines.',
    },
  ];
}

function mockOutline(data: Partial<WizardData>): OutlineSection[] {
  const topic = topicFrom(data);
  return [
    {
      id: makeId('section'),
      heading: `What ${topic} Means`,
      bullets: ['Define the topic in plain language', 'Explain who should care and why', 'Add a concise answer-style summary'],
    },
    {
      id: makeId('section'),
      heading: `Key Benefits and Tradeoffs`,
      bullets: ['Cover practical advantages', 'Include limitations and common mistakes', 'Show comparison criteria'],
    },
    {
      id: makeId('section'),
      heading: `How to Evaluate Your Options`,
      bullets: ['List decision factors', 'Explain evidence to look for', 'Connect the topic to next steps'],
    },
    {
      id: makeId('section'),
      heading: `FAQ`,
      bullets: ['Answer short questions directly', 'Use language that can be quoted by answer engines'],
    },
  ];
}

function mockGeoReport(data: Partial<WizardData>): string {
  const topic = topicFrom(data);
  return `## GEO Performance Report

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
}

function mockArticle(data: Partial<WizardData>): ArticleResult {
  const topic = topicFrom(data);
  const outline = data.outline?.length ? data.outline : mockOutline(data);
  const articleSections = outline
    .map((section) => {
      const bullets = section.bullets.map((bullet) => `- ${bullet}`).join('\n');
      return `## ${section.heading}

${section.heading.toLowerCase().includes('faq') ? '### Quick Answer\n' : ''}${topic} should be explained with concrete context, practical examples, and enough specificity for both readers and answer engines.

${bullets}

[IMAGE PLACEHOLDER]`;
    })
    .join('\n\n');

  return {
    article: `# ${data.selectedIdea?.title || `A Practical Guide to ${topic}`}

This draft targets ${keywordText(data)} in ${data.language || 'English'}. It is written to be useful for readers first while keeping clear extraction points for search engines and AI answer systems.

${articleSections}

## Final Takeaway

The best ${topic} content is specific, structured, and honest about what is known, what is inferred, and what the reader should do next.`,
    geoReport: mockGeoReport(data),
  };
}

function mockSeo(data: Partial<WizardData>): SeoMetadata {
  const topic = topicFrom(data);
  const title = data.selectedIdea?.title || `A Practical Guide to ${topic}`;
  return {
    metaTitle: title.slice(0, 60),
    metaDescription: `Learn the key benefits, tradeoffs, evaluation criteria, and GEO considerations for ${topic}.`.slice(0, 155),
    slug: slugify(title || topic),
    keywords: [data.mainKeyword || topic, ...(data.relatedKeywords ?? [])].filter(Boolean),
    socialTitle: title,
    socialDescription: `A clear, structured guide to ${topic} for search and answer-engine visibility.`,
  };
}

function mockGeneration<T>(action: GenerationAction, payload: unknown): T {
  const data = payload as Partial<WizardData>;

  switch (action) {
    case 'ideas':
      return mockIdeas(data) as T;
    case 'outline':
      return mockOutline(data) as T;
    case 'article':
    case 'article-segment':
      return mockArticle(data) as T;
    case 'seo':
      return mockSeo(data) as T;
    case 'geo':
      return mockGeoReport(data) as T;
    default:
      throw new Error(`Unsupported generation action: ${action}`);
  }
}

async function requestGeneration<T>(action: GenerationAction, payload: unknown): Promise<T> {
  if (clientMockEnabled) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return mockGeneration<T>(action, payload);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth?.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, payload }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || `Generation failed with status ${response.status}`);
  }

  return body.result as T;
}

export function generateBlogIdeas(data: WizardData) {
  return requestGeneration<BlogIdea[]>('ideas', data);
}

export function generateOutline(data: WizardData) {
  return requestGeneration<OutlineSection[]>('outline', data);
}

export function generateArticle(data: WizardData) {
  return requestGeneration<ArticleResult>('article', data);
}

export function generateArticleSegment(data: WizardData, section: OutlineSection) {
  return requestGeneration<ArticleResult>('article-segment', { ...data, section });
}

export function generateSeoMetadata(data: WizardData) {
  return requestGeneration<SeoMetadata>('seo', data);
}

export function generateGeoAnalysis(data: WizardData) {
  return requestGeneration<string>('geo', data);
}
