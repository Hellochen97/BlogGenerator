interface Step2KeywordsProps {
  mainKeyword: string;
  relatedKeywords: string[];
  onMainKeywordChange: (value: string) => void;
  onRelatedKeywordsChange: (value: string[]) => void;
}

export default function Step2Keywords({
  mainKeyword,
  relatedKeywords,
  onMainKeywordChange,
  onRelatedKeywordsChange,
}: Step2KeywordsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="main-keyword">
          Main keyword
        </label>
        <input
          id="main-keyword"
          value={mainKeyword}
          onChange={(event) => onMainKeywordChange(event.target.value)}
          placeholder="Example: AI search optimization"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="related-keywords">
          Related keywords
        </label>
        <textarea
          id="related-keywords"
          value={relatedKeywords.join(', ')}
          onChange={(event) =>
            onRelatedKeywordsChange(
              event.target.value
                .split(',')
                .map((keyword) => keyword.trim())
                .filter(Boolean),
            )
          }
          placeholder="answer engine optimization, GEO content, SEO workflow"
          rows={4}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
        />
      </div>
    </div>
  );
}
