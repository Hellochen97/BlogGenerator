import type { StepId, WizardData } from './types';

export const COLORS = {
  Ink: '#1f2937',
  Muted: '#64748b',
  Sage: '#552583',
  Amber: '#fdb927',
  Paper: '#f7f8f6',
  Line: '#d8ded8',
  White: '#ffffff',
};

export const STEPS: Array<{ id: StepId; title: string; shortTitle: string }> = [
  { id: 1, title: 'Language', shortTitle: 'Lang' },
  { id: 2, title: 'Keywords', shortTitle: 'Keys' },
  { id: 3, title: 'Requests', shortTitle: 'Brief' },
  { id: 4, title: 'Ideas', shortTitle: 'Ideas' },
  { id: 5, title: 'Length', shortTitle: 'Words' },
  { id: 6, title: 'Outline', shortTitle: 'Outline' },
  { id: 7, title: 'Article', shortTitle: 'Draft' },
  { id: 8, title: 'SEO', shortTitle: 'SEO' },
];

export const WORD_COUNT_OPTIONS = [800, 1200, 1600, 2200, 3000];

export const DEFAULT_WIZARD_DATA: WizardData = {
  language: 'English',
  mainKeyword: '',
  relatedKeywords: [],
  additionalRequests: '',
  selectedIdea: null,
  targetWordCount: 1200,
  outline: [],
  article: '',
  geoReport: '',
  seoMetadata: null,
};

export const GEO_LAYERS = ['Coverage', 'Citation', 'Behavior', 'Business'];
