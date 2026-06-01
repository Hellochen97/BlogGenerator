import { useState } from 'react';
import { Lightbulb, RefreshCcw } from 'lucide-react';
import type { BlogIdea, WizardData } from '../../types';
import { generateBlogIdeas } from '../../services/geminiService';
import Button from '../ui/Button';

interface Step4IdeasProps {
  data: WizardData;
  ideas: BlogIdea[];
  onIdeasChange: (ideas: BlogIdea[]) => void;
  onSelectIdea: (idea: BlogIdea) => void;
}

export default function Step4Ideas({ data, ideas, onIdeasChange, onSelectIdea }: Step4IdeasProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    try {
      onIdeasChange(await generateBlogIdeas(data));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to generate ideas.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Generate article angles from your keyword brief, then choose one direction.</p>
        <Button icon={<RefreshCcw size={17} />} isLoading={isLoading} onClick={handleGenerate}>
          {ideas.length ? 'Regenerate' : 'Generate Ideas'}
        </Button>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-3">
        {ideas.map((idea) => (
          <button
            key={idea.id}
            type="button"
            onClick={() => onSelectIdea(idea)}
            className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-sage hover:bg-slate-50"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-sage">
              <Lightbulb size={16} aria-hidden="true" />
              <span>{idea.audience}</span>
            </div>
            <h3 className="mt-2 text-lg font-bold text-ink">{idea.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{idea.angle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
