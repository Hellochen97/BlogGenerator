import ReactMarkdown from 'react-markdown';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import type { SavedPost } from '../types';
import Button from './ui/Button';

interface HistoryDetailViewProps {
  post: SavedPost;
  onBack: () => void;
  onLoad: (post: SavedPost) => void;
}

export default function HistoryDetailView({ post, onBack, onLoad }: HistoryDetailViewProps) {
  return (
    <main className="min-h-screen bg-paper px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-sage">Saved draft</p>
            <h1 className="text-2xl font-extrabold text-ink">{post.selectedIdea?.title || post.mainKeyword || 'Untitled draft'}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" icon={<ArrowLeft size={17} />} onClick={onBack}>
              Back
            </Button>
            <Button variant="primary" icon={<RotateCcw size={17} />} onClick={() => onLoad(post)}>
              Load
            </Button>
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_320px]">
          <article className="markdown-body rounded-lg border border-slate-200 p-5">
            <ReactMarkdown>{post.article || 'No article content saved.'}</ReactMarkdown>
          </article>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <h2 className="font-bold text-ink">GEO Report</h2>
              <div className="markdown-body mt-3 text-sm">
                <ReactMarkdown>{post.geoReport || 'No GEO report saved.'}</ReactMarkdown>
              </div>
            </div>
            {post.seoMetadata && (
              <div className="rounded-lg border border-slate-200 p-4 text-sm">
                <h2 className="font-bold text-ink">SEO Metadata</h2>
                <p className="mt-3 font-semibold">Title</p>
                <p className="text-slate-600">{post.seoMetadata.metaTitle}</p>
                <p className="mt-3 font-semibold">Description</p>
                <p className="text-slate-600">{post.seoMetadata.metaDescription}</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
