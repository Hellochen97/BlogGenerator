const LANGUAGES = ['English', 'Chinese', 'Spanish', 'French', 'German', 'Japanese'];

interface Step1LanguageProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Step1Language({ value, onChange }: Step1LanguageProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700" htmlFor="language">
        Output language
      </label>
      <select
        id="language"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
      >
        {LANGUAGES.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>
    </div>
  );
}
