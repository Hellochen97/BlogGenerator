export type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface BlogIdea {
  id: string;
  title: string;
  angle: string;
  audience: string;
}

export interface OutlineSection {
  id: string;
  heading: string;
  bullets: string[];
}

export interface SeoMetadata {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  socialTitle: string;
  socialDescription: string;
}

export interface WizardData {
  language: string;
  mainKeyword: string;
  relatedKeywords: string[];
  additionalRequests: string;
  selectedIdea: BlogIdea | null;
  targetWordCount: number;
  outline: OutlineSection[];
  article: string;
  geoReport: string;
  seoMetadata: SeoMetadata | null;
}

export interface SavedPost extends WizardData {
  id: string;
  authorUid?: string;
  authorEmail?: string | null;
  createdAt?: unknown;
}

export type GenerationAction = 'ideas' | 'outline' | 'article' | 'article-segment' | 'seo' | 'geo';

export interface ArticleResult {
  article: string;
  geoReport: string;
}
