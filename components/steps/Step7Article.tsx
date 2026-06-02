import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Code2, Copy, Eye, FileText, Pencil, RefreshCcw, SearchCheck } from 'lucide-react';
import type { WizardData } from '../../types';
import { generateArticle, generateGeoAnalysis } from '../../services/geminiService';
import Button from '../ui/Button';

interface Step7ArticleProps {
  data: WizardData;
  onChange: (data: WizardData) => void;
}

type Tab = 'article' | 'geo';
type ArticleMode = 'preview' | 'edit';
type CopyFormat = 'markdown' | 'html';

export default function Step7Article({ data, onChange }: Step7ArticleProps) {
  const [activeTab, setActiveTab] = useState<Tab>('article');
  const [articleMode, setArticleMode] = useState<ArticleMode>('preview');
  const [copiedFormat, setCopiedFormat] = useState<CopyFormat | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const articleHtmlRef = useRef<HTMLDivElement>(null);

  async function handleGenerateArticle() {
    setIsLoadingArticle(true);
    setError(null);
    try {
      const result = await generateArticle(data);
      onChange({ ...data, article: result.article, geoReport: result.geoReport });
      setActiveTab('article');
      setArticleMode('preview');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to generate article.');
    } finally {
      setIsLoadingArticle(false);
    }
  }

  async function handleGenerateGeo() {
    setIsLoadingGeo(true);
    setError(null);
    try {
      const geoReport = await generateGeoAnalysis(data);
      onChange({ ...data, geoReport });
      setActiveTab('geo');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to generate GEO report.');
    } finally {
      setIsLoadingGeo(false);
    }
  }

  async function writeClipboard(text: string) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Fall back to a temporary textarea for browsers that block Clipboard API writes.
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  async function handleCopy(format: CopyFormat) {
    const text = format === 'markdown' ? data.article : articleHtmlRef.current?.innerHTML ?? '';
    if (!text.trim()) return;

    try {
      await writeClipboard(text);
      setCopiedFormat(format);
      window.setTimeout(() => setCopiedFormat(null), 1500);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to copy article.');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Draft the article and review the GEO report generated from the same brief.</p>
        <div className="flex flex-wrap gap-2">
          <Button icon={<RefreshCcw size={17} />} isLoading={isLoadingArticle} onClick={handleGenerateArticle}>
            Generate Draft
          </Button>
          <Button variant="secondary" icon={<SearchCheck size={17} />} isLoading={isLoadingGeo} disabled={!data.article} onClick={handleGenerateGeo}>
            Refresh GEO
          </Button>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('article')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
            activeTab === 'article' ? 'bg-white text-ink shadow-sm' : 'text-slate-500'
          }`}
        >
          <FileText size={16} aria-hidden="true" />
          Article
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('geo')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
            activeTab === 'geo' ? 'bg-white text-ink shadow-sm' : 'text-slate-500'
          }`}
        >
          <SearchCheck size={16} aria-hidden="true" />
          GEO Report
        </button>
      </div>

      {activeTab === 'article' ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setArticleMode('preview')}
                className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold ${
                  articleMode === 'preview' ? 'bg-white text-ink shadow-sm' : 'text-slate-500'
                }`}
              >
                <Eye size={16} aria-hidden="true" />
                Preview
              </button>
              <button
                type="button"
                onClick={() => setArticleMode('edit')}
                className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold ${
                  articleMode === 'edit' ? 'bg-white text-ink shadow-sm' : 'text-slate-500'
                }`}
              >
                <Pencil size={16} aria-hidden="true" />
                Edit Markdown
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={<Copy size={16} />} disabled={!data.article} onClick={() => handleCopy('markdown')}>
                {copiedFormat === 'markdown' ? 'Markdown Copied' : 'Copy Markdown'}
              </Button>
              <Button variant="secondary" icon={<Code2 size={16} />} disabled={!data.article} onClick={() => handleCopy('html')}>
                {copiedFormat === 'html' ? 'HTML Copied' : 'Copy HTML'}
              </Button>
            </div>
          </div>

          <div ref={articleHtmlRef} className={articleMode === 'preview' ? 'markdown-body min-h-96 rounded-lg border border-slate-200 p-5' : 'hidden'}>
            <ReactMarkdown>{data.article || 'Generate or paste an article draft here.'}</ReactMarkdown>
          </div>

          {articleMode === 'edit' && (
            <textarea
              value={data.article}
              onChange={(event) => onChange({ ...data, article: event.target.value })}
              placeholder="Generate or paste an article draft here."
              rows={22}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
            />
          )}
        </div>
      ) : (
        <div className="markdown-body min-h-72 rounded-lg border border-slate-200 p-5">
          <ReactMarkdown>{data.geoReport || 'Generate a draft first, then review the GEO report.'}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
