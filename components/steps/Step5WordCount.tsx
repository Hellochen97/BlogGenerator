import { WORD_COUNT_OPTIONS } from '../../constants';

interface Step5WordCountProps {
  value: number;
  onChange: (value: number) => void;
}

export default function Step5WordCount({ value, onChange }: Step5WordCountProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {WORD_COUNT_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg border p-5 text-left transition ${
            value === option ? 'border-sage bg-sage text-white' : 'border-slate-200 bg-white text-ink hover:border-sage'
          }`}
        >
          <span className="text-2xl font-extrabold">{option}</span>
          <span className="ml-2 text-sm font-semibold">words</span>
        </button>
      ))}
    </div>
  );
}
