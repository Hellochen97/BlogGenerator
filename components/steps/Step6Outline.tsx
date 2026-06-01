import { useState } from 'react';
import { ListChecks, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import type { OutlineSection, WizardData } from '../../types';
import { generateOutline } from '../../services/geminiService';
import Button from '../ui/Button';

interface Step6OutlineProps {
  data: WizardData;
  onChange: (outline: OutlineSection[]) => void;
}

function makeSection(): OutlineSection {
  return {
    id: `section-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    heading: 'New section',
    bullets: ['Key point'],
  };
}

export default function Step6Outline({ data, onChange }: Step6OutlineProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    try {
      onChange(await generateOutline(data));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to generate outline.');
    } finally {
      setIsLoading(false);
    }
  }

  function updateSection(index: number, nextSection: OutlineSection) {
    onChange(data.outline.map((section, sectionIndex) => (sectionIndex === index ? nextSection : section)));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Create or edit the structure before drafting.</p>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Plus size={17} />} onClick={() => onChange([...data.outline, makeSection()])}>
            Add Section
          </Button>
          <Button icon={<RefreshCcw size={17} />} isLoading={isLoading} onClick={handleGenerate}>
            Generate Outline
          </Button>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {data.outline.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
          <ListChecks className="mx-auto mb-3" aria-hidden="true" />
          Generate an outline or add a section manually.
        </div>
      )}

      <div className="space-y-3">
        {data.outline.map((section, index) => (
          <article key={section.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-500">
                {index + 1}
              </span>
              <div className="flex-1 space-y-3">
                <input
                  value={section.heading}
                  onChange={(event) => updateSection(index, { ...section, heading: event.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 font-semibold text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
                />
                <textarea
                  value={section.bullets.join('\n')}
                  onChange={(event) =>
                    updateSection(index, {
                      ...section,
                      bullets: event.target.value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={4}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
                />
              </div>
              <Button variant="ghost" icon={<Trash2 size={16} />} onClick={() => onChange(data.outline.filter((item) => item.id !== section.id))}>
                Remove
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
