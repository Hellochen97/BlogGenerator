import { useState } from 'react';
import { RefreshCcw, Search } from 'lucide-react';
import type { SeoMetadata, WizardData } from '../../types';
import { generateSeoMetadata } from '../../services/geminiService';
import Button from '../ui/Button';

interface Step8SEOProps {
  data: WizardData;
  onChange: (metadata: SeoMetadata) => void;
}

export default function Step8SEO({ data, onChange }: Step8SEOProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    try {
      onChange(await generateSeoMetadata(data));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to generate SEO metadata.');
    } finally {
      setIsLoading(false);
    }
  }

  const metadata = data.seoMetadata;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Create editable metadata from the final draft.</p>
        <Button icon={<RefreshCcw size={17} />} isLoading={isLoading} onClick={handleGenerate}>
          Generate Metadata
        </Button>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {!metadata ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
          <Search className="mx-auto mb-3" aria-hidden="true" />
          Generate metadata after drafting the article.
        </div>
      ) : (
        <div className="grid gap-4">
          <Field label="Meta title" value={metadata.metaTitle} onChange={(value) => onChange({ ...metadata, metaTitle: value })} />
          <Field
            label="Meta description"
            value={metadata.metaDescription}
            onChange={(value) => onChange({ ...metadata, metaDescription: value })}
            multiline
          />
          <Field label="Slug" value={metadata.slug} onChange={(value) => onChange({ ...metadata, slug: value })} />
          <Field
            label="Keywords"
            value={metadata.keywords.join(', ')}
            onChange={(value) =>
              onChange({
                ...metadata,
                keywords: value
                  .split(',')
                  .map((keyword) => keyword.trim())
                  .filter(Boolean),
              })
            }
          />
          <Field label="Social title" value={metadata.socialTitle} onChange={(value) => onChange({ ...metadata, socialTitle: value })} />
          <Field
            label="Social description"
            value={metadata.socialDescription}
            onChange={(value) => onChange({ ...metadata, socialDescription: value })}
            multiline
          />
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
        />
      )}
    </label>
  );
}
